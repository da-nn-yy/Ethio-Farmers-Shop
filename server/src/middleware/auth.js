import admin from "../config/firebase.js";
import { pool } from "../config/db.js";

export const authGuard = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    // Load user from DB to attach role and internal id
    try {
      const [rows] = await pool.query(
        "SELECT id, role FROM users WHERE firebase_uid = ?",
        [decoded.uid]
      );
      if (rows.length > 0) {
        req.userDb = { id: rows[0].id, role: rows[0].role };
      } else {
        req.userDb = null;
      }
    } catch (_) {
      // If DB fails, continue; downstream handlers can decide
      req.userDb = null;
    }
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
