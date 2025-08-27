import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import admin from "firebase-admin";
import "dotenv/config";

// Initialize Firebase Admin using env-provided service account fields
const requiredEnv = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "MYSQL_HOST",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
  "MYSQL_DB",
];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`Warning: missing env ${key}`);
  }
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  }),
});

// MySQL pool
const db = await mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  connectionLimit: 10,
});

// Express app
const app = express();
app.use(cors());
app.use(express.json());

// Auth middleware
const authGuard = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const mapUserRow = (row) => ({
  id: row.id,
  firebaseUid: row.firebase_uid,
  role: row.role,
  fullName: row.full_name,
  phoneNumber: row.phone,
  email: row.email,
  region: row.region,
  woreda: row.woreda,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Health
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Ensure a user row exists for the authenticated Firebase user
app.post("/auth/sync", authGuard, async (req, res) => {
  const uid = req.user.uid;
  const [rows] = await db.query("SELECT id FROM users WHERE firebase_uid = ?", [uid]);
  if (rows.length === 0) {
    await db.query("INSERT INTO users (firebase_uid) VALUES (?)", [uid]);
  }
  res.json({ ok: true });
});

// Create/update profile (create if not exists)
app.post("/users", authGuard, async (req, res) => {
  const uid = req.user.uid;
  const { role, fullName, phoneNumber, email, region, woreda } = req.body || {};
  await db.query(
    `INSERT INTO users (firebase_uid, role, full_name, phone, email, region, woreda)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE role=VALUES(role), full_name=VALUES(full_name), phone=VALUES(phone), email=VALUES(email), region=VALUES(region), woreda=VALUES(woreda)`,
    [uid, role || null, fullName || null, phoneNumber || null, email || null, region || null, woreda || null]
  );
  res.json({ ok: true });
});

// Get current user's profile
app.get("/users/me", authGuard, async (req, res) => {
  const uid = req.user.uid;
  const [rows] = await db.query("SELECT * FROM users WHERE firebase_uid = ?", [uid]);
  if (rows.length === 0) return res.status(404).json({ error: "Profile not found" });
  res.json(mapUserRow(rows[0]));
});

// Update current user's profile
app.put("/users/me", authGuard, async (req, res) => {
  const uid = req.user.uid;
  const { role, fullName, phoneNumber, email, region, woreda } = req.body || {};
  const [existing] = await db.query("SELECT id FROM users WHERE firebase_uid = ?", [uid]);
  if (existing.length === 0) return res.status(404).json({ error: "Profile not found" });
  await db.query(
    `UPDATE users
     SET role = ?, full_name = ?, phone = ?, email = ?, region = ?, woreda = ?
     WHERE firebase_uid = ?`,
    [role || null, fullName || null, phoneNumber || null, email || null, region || null, woreda || null, uid]
  );
  const [rows] = await db.query("SELECT * FROM users WHERE firebase_uid = ?", [uid]);
  res.json(mapUserRow(rows[0]));
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
