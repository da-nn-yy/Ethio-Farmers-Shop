import { pool } from "../config/db.js";

export const listMyOrders = async (req, res) => {
  if (!req.userDb) return res.status(403).json({ error: 'Unauthorized' });
  const role = req.userDb.role;
  const userId = req.userDb.id;
  const column = role === 'buyer' ? 'buyer_user_id' : 'farmer_user_id';
  const [rows] = await pool.query(
    `SELECT * FROM orders WHERE ${column} = ? ORDER BY created_at DESC LIMIT 200`,
    [userId]
  );
  res.json({ items: rows });
};

export const createOrder = async (req, res) => {
  if (!req.userDb || req.userDb.role !== 'buyer') {
    return res.status(403).json({ error: 'Forbidden: buyer role required' });
  }
  const buyerUserId = req.userDb.id;
  const { listingId, quantity, deliveryFee = 0, notes = null } = req.body || {};
  // Load listing to get farmer and price
  const [listings] = await pool.query(
    `SELECT id, farmer_user_id, price_per_unit FROM produce_listings WHERE id = ? AND status IN ('active','low_stock')`,
    [listingId]
  );
  if (listings.length === 0) return res.status(404).json({ error: 'Listing unavailable' });
  const listing = listings[0];
  const subtotal = Number(listing.price_per_unit) * Number(quantity);
  const [orderResult] = await pool.query(
    `INSERT INTO orders (buyer_user_id, farmer_user_id, status, subtotal, delivery_fee, currency, notes)
     VALUES (?, ?, 'pending', ?, ?, 'ETB', ?)` ,
    [buyerUserId, listing.farmer_user_id, subtotal, Number(deliveryFee), notes]
  );
  const orderId = orderResult.insertId;
  await pool.query(
    `INSERT INTO order_items (order_id, listing_id, crop, unit, price_per_unit, quantity)
     SELECT ?, pl.id, pl.crop, pl.unit, pl.price_per_unit, ? FROM produce_listings pl WHERE pl.id = ?`,
    [orderId, Number(quantity), listingId]
  );
  res.status(201).json({ id: orderId, status: 'pending' });
};

export const updateOrderStatus = async (req, res) => {
  if (!req.userDb || req.userDb.role !== 'farmer') {
    return res.status(403).json({ error: 'Forbidden: farmer role required' });
  }
  const farmerUserId = req.userDb.id;
  const orderId = Number(req.params.id);
  const { status } = req.body || {};
  const allowed = ['pending','confirmed','shipped','completed','cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const [owned] = await pool.query("SELECT id FROM orders WHERE id = ? AND farmer_user_id = ?", [orderId, farmerUserId]);
  if (owned.length === 0) return res.status(404).json({ error: 'Order not found' });
  await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
  res.json({ ok: true });
};

