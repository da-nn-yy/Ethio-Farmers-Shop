import { pool } from "../config/db.js";

export const syncUser = async (req, res) => {
  const uid = req.user.uid;
  const [rows] = await pool.query("SELECT id FROM users WHERE firebase_uid = ?", [uid]);
  if (rows.length === 0) {
    await pool.query("INSERT INTO users (firebase_uid) VALUES (?)", [uid]);
  }
  res.json({ ok: true });
};
