import { pool } from "../config/db.js";

export const syncUser = async (req, res) => {
  const uid = req.user.uid;
  const [rows] = await pool.query("SELECT id FROM users WHERE firebase_uid = ?", [uid]);
  if (rows.length === 0) {
    await pool.query("INSERT INTO users (firebase_uid, role) VALUES (?, ?)", [uid, "buyer"]);
  }
  res.json({ ok: true });
};
