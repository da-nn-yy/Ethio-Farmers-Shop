import pool from "../config/db.js";
import admin from "../config/firebase.js";

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

// ADMIN/MAINTENANCE: Delete a user and cascade-remove their data (listings, orders, etc.)
export const deleteUserAndData = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    // Look up user by id
    const [userRows] = await connection.query('SELECT id FROM users WHERE id = ? LIMIT 1', [id]);
    if (userRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userRows[0].id;

    await connection.beginTransaction();

    // Best-effort cleanup across related tables regardless of role
    // Favorites where user is buyer
    await connection.query('DELETE FROM favorites WHERE buyer_user_id = ?', [userId]);

    // Order items belonging to orders of this user (as buyer or farmer)
    await connection.query(
      `DELETE oi FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.buyer_user_id = ? OR o.farmer_user_id = ?`,
      [userId, userId]
    );

    // Orders where user is buyer or farmer
    await connection.query(
      'DELETE FROM orders WHERE buyer_user_id = ? OR farmer_user_id = ?',
      [userId, userId]
    );

    // Listing images under user's listings
    await connection.query(
      `DELETE li FROM listing_images li
       WHERE li.listing_id IN (SELECT id FROM produce_listings WHERE farmer_user_id = ?)`,
      [userId]
    );

    // Listings owned by user
    await connection.query('DELETE FROM produce_listings WHERE farmer_user_id = ?', [userId]);

    // Profiles and notifications/avatars
    await connection.query('DELETE FROM farmer_profiles WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM buyer_profiles WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM notifications WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM user_avatars WHERE user_id = ?', [userId]);

    // Finally the user (remove from Firebase Auth first if possible)
    try {
      // Lookup firebase uid before deleting the row
      const [[u]] = await connection.query('SELECT firebase_uid FROM users WHERE id = ? LIMIT 1', [userId]);
      if (u && u.firebase_uid) {
        await admin.auth().deleteUser(u.firebase_uid).catch(() => {});
      }
    } catch {}
    // Delete DB user
    await connection.query('DELETE FROM users WHERE id = ?', [userId]);

    await connection.commit();
    connection.release();
    return res.json({ ok: true, deletedUserId: userId });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('deleteUserAndData error:', e);
    return res.status(500).json({ error: 'Failed to delete user and related data' });
  }
};

// ADMIN/MAINTENANCE: Remove orphan orders where buyer or farmer no longer exists
export const deleteOrphanOrders = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Delete orders referencing non-existent users
    const [orphanOrdersBefore] = await connection.query('SELECT COUNT(*) as cnt FROM orders');

    await connection.query(
      `DELETE FROM orders
       WHERE buyer_user_id NOT IN (SELECT id FROM users)
          OR farmer_user_id NOT IN (SELECT id FROM users)`
    );

    // Delete dangling order_items whose order was removed
    await connection.query(
      `DELETE oi FROM order_items oi
       LEFT JOIN orders o ON oi.order_id = o.id
       WHERE o.id IS NULL`
    );

    await connection.commit();
    const [orphanOrdersAfter] = await connection.query('SELECT COUNT(*) as cnt FROM orders');
    connection.release();
    return res.json({ ok: true, before: orphanOrdersBefore[0].cnt, after: orphanOrdersAfter[0].cnt });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('deleteOrphanOrders error:', e);
    return res.status(500).json({ error: 'Failed to delete orphan orders' });
  }
};

// ADMIN/MAINTENANCE: Delete ALL users and all related data
export const deleteAllUsersAndData = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // Fetch all firebase uids before DB deletion
    const [users] = await connection.query('SELECT id, firebase_uid FROM users');

    // Best-effort delete from Firebase Auth first
    if (users && users.length > 0) {
      for (const u of users) {
        if (u.firebase_uid) {
          try { await admin.auth().deleteUser(u.firebase_uid); } catch {}
        }
      }
    }

    await connection.beginTransaction();

    // Delete dependent tables first (order matters to satisfy FKs in varied schemas)
    await connection.query('DELETE FROM favorites');
    await connection.query('DELETE FROM notifications');
    await connection.query('DELETE FROM user_avatars');
    await connection.query('DELETE FROM farmer_profiles');
    await connection.query('DELETE FROM buyer_profiles');

    // Orders and items
    await connection.query('DELETE FROM order_items');
    await connection.query('DELETE FROM orders');

    // Reviews (both schemas use reviews with buyer/farmer refs)
    try { await connection.query('DELETE FROM reviews'); } catch {}

    // Listings and images
    await connection.query('DELETE FROM listing_images');
    await connection.query('DELETE FROM produce_listings');

    // Finally delete users
    const [result] = await connection.query('DELETE FROM users');

    await connection.commit();
    connection.release();
    return res.json({ ok: true, deletedUsers: result.affectedRows });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('deleteAllUsersAndData error:', e);
    return res.status(500).json({ error: 'Failed to delete all users and related data' });
  }
};
