import pool from "../config/db.js";

export const upsertUser = async (req, res) => {
  const uid = req.user.uid;
  const { role, fullName, phoneNumber, email, region, woreda } = req.body || {};
  await pool.query(
    `INSERT INTO users (firebase_uid, role, full_name, phone, email, region, woreda)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE role=VALUES(role), full_name=VALUES(full_name), phone=VALUES(phone), email=VALUES(email), region=VALUES(region), woreda=VALUES(woreda)`,
    [uid, role || "buyer", fullName || null, phoneNumber || null, email || null, region || null, woreda || null]
  );
  res.json({ ok: true });
};

export const getMe = async (req, res) => {
  const uid = req.user.uid;
  // Ensure avatars table exists to avoid errors on first run
  await pool.query(`CREATE TABLE IF NOT EXISTS user_avatars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    url VARCHAR(1024) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  const [rows] = await pool.query(
    `SELECT u.*, (
       SELECT ua.url FROM user_avatars ua
       WHERE ua.user_id = u.id
       ORDER BY ua.updated_at DESC
       LIMIT 1
     ) AS avatar_url
     FROM users u WHERE u.firebase_uid = ?`,
    [uid]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Profile not found" });
  const row = rows[0];
  res.json({
    id: row.id,
    firebaseUid: row.firebase_uid,
    role: row.role,
    fullName: row.full_name,
    phoneNumber: row.phone,
    email: row.email,
    region: row.region,
    woreda: row.woreda,
    avatarUrl: row.avatar_url || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
};

export const updateMe = async (req, res) => {
  const uid = req.user.uid;
  const { role, fullName, phoneNumber, email, region, woreda } = req.body || {};
  const [existing] = await pool.query("SELECT id FROM users WHERE firebase_uid = ?", [uid]);
  if (existing.length === 0) return res.status(404).json({ error: "Profile not found" });
  const toNullIfEmpty = (v) => (v === undefined || v === "" ? null : v);
  await pool.query(
    `UPDATE users
     SET role = COALESCE(?, role),
         full_name = COALESCE(?, full_name),
         phone = COALESCE(?, phone),
         email = COALESCE(?, email),
         region = COALESCE(?, region),
         woreda = COALESCE(?, woreda)
     WHERE firebase_uid = ?`,
    [
      toNullIfEmpty(role),
      toNullIfEmpty(fullName),
      toNullIfEmpty(phoneNumber),
      toNullIfEmpty(email),
      toNullIfEmpty(region),
      toNullIfEmpty(woreda),
      uid,
    ]
  );
  const [rows] = await pool.query("SELECT * FROM users WHERE firebase_uid = ?", [uid]);
  const row = rows[0];
  res.json({
    id: row.id,
    firebaseUid: row.firebase_uid,
    role: row.role,
    fullName: row.full_name,
    phoneNumber: row.phone,
    email: row.email,
    region: row.region,
    woreda: row.woreda,
    avatarUrl: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
};

// Upload and save avatar URL for current user
export const uploadMyAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const uid = req.user.uid;
    const [[userRow]] = await pool.query('SELECT id FROM users WHERE firebase_uid = ? LIMIT 1', [uid]);
    if (!userRow) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const userId = userRow.id;

    // Ensure table exists (idempotent)
    await pool.query(`CREATE TABLE IF NOT EXISTS user_avatars (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      url VARCHAR(1024) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Insert new avatar record
    await pool.query('INSERT INTO user_avatars (user_id, url) VALUES (?, ?)', [userId, imageUrl]);

    return res.status(201).json({ message: 'Avatar uploaded', avatarUrl: imageUrl });
  } catch (e) {
    console.error('uploadMyAvatar error:', e);
    return res.status(500).json({ error: 'Failed to upload avatar' });
  }
};
