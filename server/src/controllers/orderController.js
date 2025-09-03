import { pool } from '../config/database.js';

// Create new order (buyer places order)
export const createOrder = async (req, res) => {
  try {
    const { listingId, quantity, totalPrice, notes } = req.body;
    const buyerFirebaseUid = req.user.uid; // From auth middleware

    const connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Resolve buyer user_id from firebase_uid
      const [buyerRows] = await connection.execute(
        'SELECT id FROM users WHERE firebase_uid = ?',
        [buyerFirebaseUid]
      );
      if (buyerRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Buyer not found' });
      }
      const buyerId = buyerRows[0].id;

      // Get listing details and check availability
      const [listingRows] = await connection.execute(
        'SELECT id, farmer_user_id, crop, unit, title as name, price_per_unit as pricePerUnit, quantity as availableQuantity, region as location FROM produce_listings WHERE id = ? AND status = "active"',
        [listingId]
      );

      if (listingRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Listing not found or inactive' });
      }

      const listing = listingRows[0];

      if (listing.availableQuantity < quantity) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: 'Insufficient quantity available' });
      }

      // Calculate totals (server-trusted)
      const lineTotal = Number(listing.pricePerUnit) * Number(quantity);

      // Create order (subtotal only, delivery_fee default 0)
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          buyer_user_id,
          farmer_user_id,
          status,
          subtotal,
          currency,
          notes,
          created_at
        ) VALUES (?, ?, 'pending', ?, 'ETB', ?, NOW())`,
        [buyerId, listing.farmer_user_id, lineTotal, notes || null]
      );

      const orderId = orderResult.insertId;

      // Insert order item (snapshot)
      await connection.execute(
        `INSERT INTO order_items (
          order_id,
          listing_id,
          crop,
          unit,
          price_per_unit,
          quantity
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, listingId, listing.crop, listing.unit || 'kg', listing.pricePerUnit, quantity]
      );

      // Update listing availability
      await connection.execute('UPDATE produce_listings SET quantity = quantity - ? WHERE id = ?', [quantity, listingId]);

      // Update listing status if quantity becomes 0
      const remaining = listing.availableQuantity - Number(quantity);
      if (remaining === 0) {
        await connection.execute('UPDATE produce_listings SET status = "sold" WHERE id = ?', [listingId]);
      }

      // Commit transaction
      await connection.commit();

      // Get the created order with details
      const [orderRows] = await connection.execute(
        `SELECT
          o.id,
          o.status,
          o.subtotal as totalPrice,
          o.notes,
          o.created_at as createdAt,
          oi.quantity,
          pl.title as name,
          li.url as image,
          pl.price_per_unit as pricePerKg,
          u.full_name as farmerName,
          pl.region as location
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN produce_listings pl ON oi.listing_id = pl.id
        LEFT JOIN listing_images li ON pl.id = li.listing_id AND li.sort_order = 0
        JOIN users u ON pl.farmer_user_id = u.id
        WHERE o.id = ?
        LIMIT 1`,
        [orderId]
      );

      connection.release();

      res.status(201).json({
        message: 'Order created successfully',
        order: orderRows[0]
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get buyer's orders
export const getBuyerOrders = async (req, res) => {
  try {
    const buyerFirebaseUid = req.user.uid;
    const { status, limit = 20, offset = 0 } = req.query;

    const connection = await pool.getConnection();

    // Resolve buyer id
    const [buyerRows] = await pool.query('SELECT id FROM users WHERE firebase_uid = ?', [buyerFirebaseUid]);
    if (buyerRows.length === 0) return res.json([]);
    const buyerId = buyerRows[0].id;

    let whereClause = 'WHERE o.buyer_user_id = ?';
    const params = [buyerId];

    if (status && status !== 'all') {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    const limitInt = Number(limit) || 20;
    const offsetInt = Number(offset) || 0;

    const query = `
      SELECT
        o.id,
        o.subtotal as totalPrice,
        o.status,
        o.notes,
        o.created_at as createdAt,
        o.updated_at as updatedAt,
        oi.quantity,
        pl.title as name,
        li.url as image,
        pl.price_per_unit as pricePerKg,
        u.full_name as farmerName,
        NULL as farmerAvatar,
        pl.region as location,
        u.phone as farmerPhone,
        u.email as farmerEmail
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN produce_listings pl ON oi.listing_id = pl.id
      LEFT JOIN listing_images li ON pl.id = li.listing_id AND li.sort_order = 0
      JOIN users u ON pl.farmer_user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;

    const [rows] = await connection.execute(query, params);
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get specific order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userFirebaseUid = req.user.uid;

    const connection = await pool.getConnection();

    const query = `
      SELECT
        o.id,
        o.subtotal as totalPrice,
        o.status,
        o.notes,
        o.created_at as createdAt,
        o.updated_at as updatedAt,
        oi.quantity,
        pl.title as name,
        pl.description,
        li.url as image,
        pl.price_per_unit as pricePerKg,
        pl.crop as category,
        u.full_name as farmerName,
        NULL as farmerAvatar,
        pl.region as location,
        u.phone as farmerPhone,
        u.email as farmerEmail
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN produce_listings pl ON oi.listing_id = pl.id
      JOIN users u ON pl.farmer_user_id = u.id
      LEFT JOIN listing_images li ON pl.id = li.listing_id AND li.sort_order = 0
      WHERE o.id = ? AND (o.buyer_user_id = (SELECT id FROM users WHERE firebase_uid = ?) OR pl.farmer_user_id = (SELECT id FROM users WHERE firebase_uid = ?))
    `;

    const [rows] = await connection.execute(query, [id, userFirebaseUid, userFirebaseUid]);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Update order status (farmer updates)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const connection = await pool.getConnection();

        // Verify the user is the farmer for this order
    const [orderRows] = await connection.execute(
      `SELECT o.farmer_id FROM orders o WHERE o.id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderRows[0].farmer_id !== userId) {
      connection.release();
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Update order status
    await connection.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    connection.release();

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Cancel order (buyer can cancel pending orders)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    const connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Get order details
      const [orderRows] = await connection.execute(
        'SELECT * FROM orders WHERE id = ? AND buyer_id = ? AND status = "pending"',
        [id, buyerId]
      );

      if (orderRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Order not found or cannot be cancelled' });
      }

      const order = orderRows[0];

      // Update order status to cancelled
      await connection.execute(
        'UPDATE orders SET status = "cancelled", updated_at = NOW() WHERE id = ?',
        [id]
      );

      // Restore listing quantity
      await connection.execute(
        'UPDATE produce_listings SET available_quantity = available_quantity + ? WHERE id = ?',
        [order.quantity, order.listing_id]
      );

      // Update listing status back to active if it was sold out
      await connection.execute(
        'UPDATE produce_listings SET status = "active" WHERE id = ? AND status = "sold_out"',
        [order.listing_id]
      );

      // Commit transaction
      await connection.commit();

      connection.release();

      res.json({ message: 'Order cancelled successfully' });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};
