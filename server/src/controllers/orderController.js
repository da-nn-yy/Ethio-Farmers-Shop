import { pool } from '../config/database.js';
import { createOrderNotification } from './notificationController.js';

// Create new order (buyer places order)
export const createOrder = async (req, res) => {
  try {
    const { items, notes, deliveryFee = 0 } = req.body;
    const buyerFirebaseUid = req.user.uid; // From auth middleware

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

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

      let totalSubtotal = 0;
      const orderItems = [];

      // Process each item
      for (const item of items) {
        const { listingId, quantity } = item;

        if (!listingId || !quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ error: 'Each item must have listingId and quantity' });
        }

        // Get listing details and check availability
        const [listingRows] = await connection.execute(
          'SELECT id, farmer_user_id, crop, unit, title as name, price_per_unit as pricePerUnit, quantity as availableQuantity, region as location FROM produce_listings WHERE id = ? AND status = "active"',
          [listingId]
        );

        if (listingRows.length === 0) {
          await connection.rollback();
          connection.release();
          return res.status(404).json({ error: `Listing ${listingId} not found or inactive` });
        }

        const listing = listingRows[0];

        if (listing.availableQuantity < quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ error: `Insufficient quantity available for ${listing.name}` });
        }

        // Calculate line total
        const lineTotal = Number(listing.pricePerUnit) * Number(quantity);
        totalSubtotal += lineTotal;

        orderItems.push({
          listingId,
          quantity,
          listing,
          lineTotal
        });
      }

      // For multi-item orders, we'll use the first farmer as the primary farmer
      // In a real system, you might want to create separate orders per farmer
      const primaryFarmerId = orderItems[0].listing.farmer_user_id;

      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          buyer_user_id,
          farmer_user_id,
          status,
          subtotal,
          delivery_fee,
          currency,
          notes,
          created_at
        ) VALUES (?, ?, 'pending', ?, ?, 'ETB', ?, NOW())`,
        [buyerId, primaryFarmerId, totalSubtotal, deliveryFee, notes || null]
      );

      const orderId = orderResult.insertId;

      // Insert order items and update listings
      for (const item of orderItems) {
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
          [orderId, item.listingId, item.listing.crop, item.listing.unit || 'kg', item.listing.pricePerUnit, item.quantity]
        );

        // Update listing availability
        await connection.execute('UPDATE produce_listings SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.listingId]);

        // Update listing status if quantity becomes 0
        const remaining = item.listing.availableQuantity - Number(item.quantity);
        if (remaining === 0) {
          await connection.execute('UPDATE produce_listings SET status = "sold" WHERE id = ?', [item.listingId]);
        }
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

      // Notify farmer of new order
      try {
        await createOrderNotification(orderId, 'order_created', primaryFarmerId);
      } catch (e) {
        console.error('Failed to create order notification:', e);
      }

      res.status(201).json({
        message: 'Order created successfully',
        order: orderRows[0],
        totalItems: orderItems.length
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
    // Resolve current user DB id
    const uid = req.user.uid;
    let userId;
    if (uid && uid.startsWith('dev-uid-')) {
      userId = req.user.id;
    } else {
      const [userRows] = await pool.query('SELECT id FROM users WHERE firebase_uid = ?', [uid]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      userId = userRows[0].id;
    }

    const connection = await pool.getConnection();

        // Verify the user is the farmer for this order
    const [orderRows] = await connection.execute(
      `SELECT o.farmer_user_id FROM orders o WHERE o.id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderRows[0].farmer_user_id !== userId) {
      connection.release();
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Update order status
    await connection.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    connection.release();

    // Create notifications on important transitions
    try {
      if (status === 'confirmed') {
        // Notify buyer that order confirmed
        const [buyerRows] = await pool.query('SELECT buyer_user_id FROM orders WHERE id = ?', [id]);
        const buyerUserId = buyerRows?.[0]?.buyer_user_id;
        if (buyerUserId) await createOrderNotification(id, 'order_confirmed', buyerUserId);
      } else if (status === 'completed') {
        const [buyerRows] = await pool.query('SELECT buyer_user_id FROM orders WHERE id = ?', [id]);
        const buyerUserId = buyerRows?.[0]?.buyer_user_id;
        if (buyerUserId) await createOrderNotification(id, 'order_completed', buyerUserId);
      } else if (status === 'cancelled') {
        const [buyerRows] = await pool.query('SELECT buyer_user_id FROM orders WHERE id = ?', [id]);
        const buyerUserId = buyerRows?.[0]?.buyer_user_id;
        if (buyerUserId) await createOrderNotification(id, 'order_cancelled', buyerUserId);
      }
    } catch (e) {
      console.error('Failed to create status notification:', e);
    }

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
    // Resolve buyer user id
    const uid = req.user.uid;
    let buyerId;
    if (uid && uid.startsWith('dev-uid-')) {
      buyerId = req.user.id;
    } else {
      const [userRows] = await pool.query('SELECT id FROM users WHERE firebase_uid = ?', [uid]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      buyerId = userRows[0].id;
    }

    const connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Get order details
      const [orderRows] = await connection.execute(
        'SELECT id FROM orders WHERE id = ? AND buyer_user_id = ? AND status = "pending"',
        [id, buyerId]
      );

      if (orderRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Order not found or cannot be cancelled' });
      }

      // Update order status to cancelled
      await connection.execute(
        'UPDATE orders SET status = "cancelled", updated_at = NOW() WHERE id = ?',
        [id]
      );

      // Restore listing quantities for items in this order
      const [items] = await connection.execute(
        'SELECT listing_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );
      for (const it of items) {
        await connection.execute(
          'UPDATE produce_listings SET quantity = quantity + ? WHERE id = ?',
          [it.quantity, it.listing_id]
        );
        // If previously sold, ensure status is active again when quantity > 0
        await connection.execute(
          'UPDATE produce_listings SET status = "active" WHERE id = ? AND quantity > 0',
          [it.listing_id]
        );
      }

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

// Get farmer's orders
export const getFarmerOrders = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { status, page = 1, limit = 20 } = req.query;

    // Get user ID
    let userId;

    if (uid.startsWith('dev-uid-')) {
      // Dev user - use the ID from the token
      userId = req.user.id;
    } else {
      // Real Firebase user - look up in database
      const [userRows] = await pool.query(
        "SELECT id FROM users WHERE firebase_uid = ?",
        [uid]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      userId = userRows[0].id;
    }
    let whereClause = "WHERE o.farmer_user_id = ?";
    let params = [userId];

    if (status) {
      whereClause += " AND o.status = ?";
      params.push(status);
    }

    const offset = (page - 1) * limit;

    // Get orders with buyer info
    const [orders] = await pool.query(
      `SELECT
        o.*,
        u.full_name as buyer_name,
        u.phone as buyer_phone,
        u.region as buyer_region,
        u.woreda as buyer_woreda,
        bp.company_name,
        bp.business_type
      FROM orders o
      JOIN users u ON o.buyer_user_id = u.id
      LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get order items for each order
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT
          oi.*,
          pl.title as listing_title,
          NULL as image_url
        FROM order_items oi
        JOIN produce_listings pl ON oi.listing_id = pl.id
        WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { period = 'month' } = req.query;

    // Get user ID and role
    let userId, userRole;

    if (uid.startsWith('dev-uid-')) {
      // Dev user - use the ID and role from the token
      userId = req.user.id;
      userRole = req.user.role;
    } else {
      // Real Firebase user - look up in database
      const [userRows] = await pool.query(
        "SELECT id, role FROM users WHERE firebase_uid = ?",
        [uid]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      userId = userRows[0].id;
      userRole = userRows[0].role;
    }

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === 'month') {
      dateFilter = "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    } else if (period === 'year') {
      dateFilter = "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
    }

    let statsQuery = '';
    if (userRole === 'buyer') {
      statsQuery = `
        SELECT
          COUNT(*) as total_orders,
          SUM(o.total) as total_spent,
          COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders
        FROM orders o
        WHERE o.buyer_user_id = ? ${dateFilter}
      `;
    } else {
      statsQuery = `
        SELECT
          COUNT(*) as total_orders,
          SUM(o.total) as total_earnings,
          COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders
        FROM orders o
        WHERE o.farmer_user_id = ? ${dateFilter}
      `;
    }

    const [stats] = await pool.query(statsQuery, [userId]);

    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: "Failed to fetch order statistics" });
  }
};
