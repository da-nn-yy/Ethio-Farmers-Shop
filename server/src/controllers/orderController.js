import { pool } from '../config/database.js';

// Create new order (buyer places order)
export const createOrder = async (req, res) => {
  try {
    const { listingId, quantity, totalPrice, notes } = req.body;
    const buyerId = req.user.id; // From auth middleware

    const connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Get listing details and check availability
      const [listingRows] = await connection.execute(
        'SELECT * FROM produce_listings WHERE id = ? AND status = "active"',
        [listingId]
      );

      if (listingRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Listing not found or inactive' });
      }

      const listing = listingRows[0];

      if (listing.available_quantity < quantity) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: 'Insufficient quantity available' });
      }

      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          buyer_id,
          listing_id,
          quantity,
          total_price,
          status,
          notes,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [buyerId, listingId, quantity, totalPrice, 'pending', notes]
      );

      const orderId = orderResult.insertId;

      // Update listing availability
      await connection.execute(
        'UPDATE produce_listings SET available_quantity = available_quantity - ? WHERE id = ?',
        [quantity, listingId]
      );

      // Update listing status if quantity becomes 0
      if (listing.available_quantity - quantity === 0) {
        await connection.execute(
          'UPDATE produce_listings SET status = "sold_out" WHERE id = ?',
          [listingId]
        );
      }

      // Commit transaction
      await connection.commit();

      // Get the created order with details
      const [orderRows] = await connection.execute(
        `SELECT
          o.id,
          o.quantity,
          o.total_price as totalPrice,
          o.status,
          o.notes,
          o.created_at as createdAt,
          pl.name,
          pl.name_am as nameAm,
          pl.image_url as image,
          pl.price_per_kg as pricePerKg,
          u.full_name as farmerName,
          pl.location
        FROM orders o
        JOIN produce_listings pl ON o.listing_id = pl.id
        JOIN users u ON pl.farmer_id = u.id
        WHERE o.id = ?`,
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
    const buyerId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;

    const connection = await pool.getConnection();

    let whereClause = 'WHERE o.buyer_id = ?';
    const params = [buyerId];

    if (status && status !== 'all') {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    const query = `
      SELECT
        o.id,
        o.quantity,
        o.total_price as totalPrice,
        o.status,
        o.notes,
        o.created_at as createdAt,
        o.updated_at as updatedAt,
        pl.name,
        pl.name_am as nameAm,
        pl.image_url as image,
        pl.price_per_kg as pricePerKg,
        u.full_name as farmerName,
        u.avatar as farmerAvatar,
        pl.location,
        u.phone as farmerPhone,
        u.email as farmerEmail
      FROM orders o
      JOIN produce_listings pl ON o.listing_id = pl.id
      JOIN users u ON pl.farmer_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(Number(limit), Number(offset));

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
    const userId = req.user.id;

    const connection = await pool.getConnection();

    const query = `
      SELECT
        o.id,
        o.quantity,
        o.total_price as totalPrice,
        o.status,
        o.notes,
        o.created_at as createdAt,
        o.updated_at as updatedAt,
        pl.title as name,
        pl.crop as nameAm,
        pl.description,
        li.url as image,
        pl.price_per_unit as pricePerKg,
        pl.crop as category,
        u.full_name as farmerName,
        u.avatar_url as farmerAvatar,
        pl.region as location,
        u.phone as farmerPhone,
        u.email as farmerEmail
      FROM orders o
      JOIN produce_listings pl ON o.listing_id = pl.id
      JOIN users u ON pl.farmer_user_id = u.id
      LEFT JOIN listing_images li ON pl.id = li.listing_id AND li.sort_order = 0
      WHERE o.id = ? AND (o.buyer_user_id = ? OR pl.farmer_user_id = ?)
    `;

    const [rows] = await connection.execute(query, [id, userId, userId]);
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
