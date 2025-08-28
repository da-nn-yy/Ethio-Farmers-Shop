import { pool } from "../config/db.js";

export const listFavorites = async (req, res) => {
  if (!req.userDb || req.userDb.role !== 'buyer') {
    return res.status(403).json({ error: 'Forbidden: buyer role required' });
  }
  const buyerUserId = req.userDb.id;
  const [rows] = await pool.query(
    `SELECT f.listing_id, pl.crop, pl.title, pl.price_per_unit, pl.unit, pl.region, pl.woreda,
            u.id AS farmer_user_id, u.full_name AS farmer_name
     FROM favorites f
     JOIN produce_listings pl ON pl.id = f.listing_id
     JOIN users u ON u.id = pl.farmer_user_id
     WHERE f.buyer_user_id = ?
     ORDER BY f.created_at DESC`,
    [buyerUserId]
  );
  res.json({ items: rows });
};

export const listFavoriteFarmers = async (req, res) => {
  if (!req.userDb || req.userDb.role !== 'buyer') {
    return res.status(403).json({ error: 'Forbidden: buyer role required' });
  }
  const buyerUserId = req.userDb.id;
  const [rows] = await pool.query(
    `SELECT DISTINCT u.id AS farmer_user_id, COALESCE(u.full_name, 'Farmer') AS farmer_name,
            ANY_VALUE(pl.region) AS region, ANY_VALUE(pl.woreda) AS woreda
     FROM favorites f
     JOIN produce_listings pl ON pl.id = f.listing_id
     JOIN users u ON u.id = pl.farmer_user_id
     WHERE f.buyer_user_id = ?
     ORDER BY farmer_name ASC`,
    [buyerUserId]
  );
  res.json({ items: rows });
};

export const addFavorite = async (req, res) => {
  if (!req.userDb || req.userDb.role !== 'buyer') {
    return res.status(403).json({ error: 'Forbidden: buyer role required' });
  }
  const buyerUserId = req.userDb.id;
  const { listingId } = req.body || {};
  await pool.query(
    `INSERT IGNORE INTO favorites (buyer_user_id, listing_id) VALUES (?, ?)`,
    [buyerUserId, Number(listingId)]
  );
  res.status(201).json({ ok: true });
};

export const removeFavorite = async (req, res) => {
  if (!req.userDb || req.userDb.role !== 'buyer') {
    return res.status(403).json({ error: 'Forbidden: buyer role required' });
  }
  const buyerUserId = req.userDb.id;
  const listingId = Number(req.params.listingId);
  await pool.query(
    `DELETE FROM favorites WHERE buyer_user_id = ? AND listing_id = ?`,
    [buyerUserId, listingId]
  );
  res.json({ ok: true });
};

