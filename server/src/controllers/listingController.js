import { pool } from "../config/db.js";

export const listListings = async (req, res) => {
  const { q, region, minPrice, maxPrice, crop, page = 1, pageSize = 20 } = req.query;
  const where = [];
  const params = [];
  if (q) {
    where.push("(pl.title LIKE ? OR pl.crop LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (region) { where.push("pl.region = ?"); params.push(region); }
  if (crop) { where.push("pl.crop = ?"); params.push(crop); }
  if (minPrice) { where.push("pl.price_per_unit >= ?"); params.push(Number(minPrice)); }
  if (maxPrice) { where.push("pl.price_per_unit <= ?"); params.push(Number(maxPrice)); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  const [rows] = await pool.query(
    `SELECT pl.id, pl.title, pl.crop, pl.variety, pl.quantity, pl.unit, pl.price_per_unit, pl.currency,
            pl.region, pl.woreda, pl.status, pl.created_at,
            u.id AS farmer_user_id
     FROM produce_listings pl
     JOIN users u ON u.id = pl.farmer_user_id
     ${whereSql}
     ORDER BY pl.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  );
  const [[countRow]] = await pool.query(
    `SELECT COUNT(*) AS total FROM produce_listings pl ${whereSql}`,
    params
  );
  res.json({ items: rows, page: Number(page), pageSize: Number(pageSize), total: Number(countRow.total) });
};

export const createListing = async (req, res) => {
  if (!req.userDb || req.userDb.role !== 'farmer') {
    return res.status(403).json({ error: 'Forbidden: farmer role required' });
  }
  const farmerUserId = req.userDb.id;
  const { title, crop, variety, quantity, unit, pricePerUnit, currency = 'ETB', region, woreda, description } = req.body || {};
  const [result] = await pool.query(
    `INSERT INTO produce_listings (farmer_user_id, title, crop, variety, quantity, unit, price_per_unit, currency, region, woreda, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [farmerUserId, title, crop, variety || null, quantity, unit, pricePerUnit, currency, region || null, woreda || null, description || null]
  );
  res.status(201).json({ id: result.insertId });
};

export const updateListing = async (req, res) => {
  if (!req.userDb || req.userDb.role !== 'farmer') {
    return res.status(403).json({ error: 'Forbidden: farmer role required' });
  }
  const farmerUserId = req.userDb.id;
  const listingId = Number(req.params.id);
  const { title, crop, variety, quantity, unit, pricePerUnit, currency, region, woreda, description, status } = req.body || {};
  // Ensure listing belongs to farmer
  const [owned] = await pool.query("SELECT id FROM produce_listings WHERE id = ? AND farmer_user_id = ?", [listingId, farmerUserId]);
  if (owned.length === 0) return res.status(404).json({ error: 'Listing not found' });
  await pool.query(
    `UPDATE produce_listings SET
       title = COALESCE(?, title),
       crop = COALESCE(?, crop),
       variety = COALESCE(?, variety),
       quantity = COALESCE(?, quantity),
       unit = COALESCE(?, unit),
       price_per_unit = COALESCE(?, price_per_unit),
       currency = COALESCE(?, currency),
       region = COALESCE(?, region),
       woreda = COALESCE(?, woreda),
       description = COALESCE(?, description),
       status = COALESCE(?, status)
     WHERE id = ?`,
    [title, crop, variety, quantity, unit, pricePerUnit, currency, region, woreda, description, status, listingId]
  );
  res.json({ ok: true });
};

export const deleteListing = async (req, res) => {
  if (!req.userDb || req.userDb.role !== 'farmer') {
    return res.status(403).json({ error: 'Forbidden: farmer role required' });
  }
  const farmerUserId = req.userDb.id;
  const listingId = Number(req.params.id);
  const [owned] = await pool.query("SELECT id FROM produce_listings WHERE id = ? AND farmer_user_id = ?", [listingId, farmerUserId]);
  if (owned.length === 0) return res.status(404).json({ error: 'Listing not found' });
  await pool.query("DELETE FROM produce_listings WHERE id = ?", [listingId]);
  res.json({ ok: true });
};

export const getListingById = async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await pool.query(
    `SELECT pl.id, pl.title, pl.crop, pl.variety, pl.quantity, pl.unit, pl.price_per_unit, pl.currency,
            pl.region, pl.woreda, pl.status, pl.description, pl.created_at,
            u.id AS farmer_user_id
     FROM produce_listings pl
     JOIN users u ON u.id = pl.farmer_user_id
     WHERE pl.id = ?
     LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
};

