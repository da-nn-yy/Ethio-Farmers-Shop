import { pool } from "../config/db.js";

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { userId, type, payload, isRead = false } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ error: "User ID and type are required" });
    }

    // Verify user exists
    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Insert notification
    const [result] = await pool.query(
      `INSERT INTO notifications (user_id, type, payload, is_read)
       VALUES (?, ?, ?, ?)`,
      [userId, type, JSON.stringify(payload), isRead]
    );

    res.status(201).json({
      id: result.insertId,
      message: "Notification created successfully"
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: "Failed to create notification" });
  }
};

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // Get user ID - support dev tokens and real Firebase users
    let userId;
    if (uid && uid.startsWith('dev-uid-')) {
      userId = req.user.id; // provided by auth middleware for dev tokens
    } else {
      const [userRows] = await pool.query(
        "SELECT id FROM users WHERE firebase_uid = ?",
        [uid]
      );
      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      userId = userRows[0].id;
    }
    const offset = (page - 1) * limit;

    let whereClause = "WHERE user_id = ?";
    let params = [userId];

    if (unreadOnly === 'true') {
      whereClause += " AND is_read = 0";
    }

    // Get notifications
    const [notifications] = await pool.query(
      `SELECT * FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Normalize payload: if it's a JSON string, parse it; if already object/NULL, leave as is
    notifications.forEach(notification => {
      if (notification.payload && typeof notification.payload === 'string') {
        try {
          notification.payload = JSON.parse(notification.payload);
        } catch (e) {
          // Keep original string if parsing fails
        }
      }
    });

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get unread count
    const [unreadResult] = await pool.query(
      "SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId]
    );

    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      unreadCount: unreadResult[0].unread
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    // Get user ID - support dev tokens and real Firebase users
    let userId;
    if (uid && uid.startsWith('dev-uid-')) {
      userId = req.user.id;
    } else {
      const [userRows] = await pool.query(
        "SELECT id FROM users WHERE firebase_uid = ?",
        [uid]
      );
      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      userId = userRows[0].id;
    }

    // Mark notification as read
    const [result] = await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    const uid = req.user.uid;

    // Get user ID - support dev tokens and real Firebase users
    let userId;
    if (uid && uid.startsWith('dev-uid-')) {
      userId = req.user.id;
    } else {
      const [userRows] = await pool.query(
        "SELECT id FROM users WHERE firebase_uid = ?",
        [uid]
      );
      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      userId = userRows[0].id;
    }

    // Mark all notifications as read
    await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
      [userId]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    // Get user ID - support dev tokens and real Firebase users
    let userId;
    if (uid && uid.startsWith('dev-uid-')) {
      userId = req.user.id;
    } else {
      const [userRows] = await pool.query(
        "SELECT id FROM users WHERE firebase_uid = ?",
        [uid]
      );
      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      userId = userRows[0].id;
    }

    // Delete notification
    const [result] = await pool.query(
      "DELETE FROM notifications WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const uid = req.user.uid;

    // Get user ID - support dev tokens and real Firebase users
    let userId;
    if (uid && uid.startsWith('dev-uid-')) {
      userId = req.user.id;
    } else {
      const [userRows] = await pool.query(
        "SELECT id FROM users WHERE firebase_uid = ?",
        [uid]
      );
      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      userId = userRows[0].id;
    }

    // Get notification statistics
    const [stats] = await pool.query(
      `SELECT
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN is_read = 0 THEN 1 END) as unread_count,
        COUNT(CASE WHEN is_read = 1 THEN 1 END) as read_count,
        MAX(created_at) as last_notification
      FROM notifications
      WHERE user_id = ?`,
      [userId]
    );

    // Get notifications by type
    const [typeBreakdown] = await pool.query(
      `SELECT
        type,
        COUNT(*) as count
      FROM notifications
      WHERE user_id = ?
      GROUP BY type
      ORDER BY count DESC`,
      [userId]
    );

    // Get recent notification types
    const [recentTypes] = await pool.query(
      `SELECT
        type,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10`,
      [userId]
    );

    res.json({
      stats: stats[0] || {
        total_notifications: 0,
        unread_count: 0,
        read_count: 0,
        last_notification: null
      },
      typeBreakdown,
      recentTypes
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: "Failed to fetch notification statistics" });
  }
};

// Create system notifications (for order updates, price alerts, etc.)
export const createSystemNotification = async (req, res) => {
  try {
    const { type, userIds, payload, title, message } = req.body;

    if (!type || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Type and user IDs array are required" });
    }

    // Verify all users exist
    const placeholders = userIds.map(() => '?').join(',');
    const [userRows] = await pool.query(
      `SELECT id FROM users WHERE id IN (${placeholders})`,
      userIds
    );

    if (userRows.length !== userIds.length) {
      return res.status(400).json({ error: "Some users not found" });
    }

    // Create notifications for all users
    const notificationData = userIds.map(userId => [
      userId,
      type,
      JSON.stringify({ ...payload, title, message }),
      0 // is_read = false
    ]);

    await pool.query(
      "INSERT INTO notifications (user_id, type, payload, is_read) VALUES ?",
      [notificationData]
    );

    res.json({
      message: `Notifications created for ${userIds.length} users`,
      count: userIds.length
    });
  } catch (error) {
    console.error('Error creating system notifications:', error);
    res.status(500).json({ error: "Failed to create system notifications" });
  }
};

// Create order-related notifications
export const createOrderNotification = async (orderId, type, userId) => {
  try {
    let payload = {};
    let notificationType = '';

    switch (type) {
      case 'order_created':
        notificationType = 'order_update';
        payload = {
          title: 'New Order Received',
          message: 'You have received a new order',
          orderId,
          action: 'view_order'
        };
        break;
      case 'order_confirmed':
        notificationType = 'order_update';
        payload = {
          title: 'Order Confirmed',
          message: 'Your order has been confirmed by the farmer',
          orderId,
          action: 'view_order'
        };
        break;
      case 'order_shipped':
        notificationType = 'order_update';
        payload = {
          title: 'Order Shipped',
          message: 'Your order has been shipped',
          orderId,
          action: 'view_order'
        };
        break;
      case 'order_completed':
        notificationType = 'order_update';
        payload = {
          title: 'Order Completed',
          message: 'Your order has been completed successfully',
          orderId,
          action: 'view_order'
        };
        break;
      case 'order_cancelled':
        notificationType = 'order_update';
        payload = {
          title: 'Order Cancelled',
          message: 'Your order has been cancelled',
          orderId,
          action: 'view_order'
        };
        break;
      default:
        return;
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, payload, is_read)
       VALUES (?, ?, ?, ?)`,
      [userId, notificationType, JSON.stringify(payload), 0]
    );
  } catch (error) {
    console.error('Error creating order notification:', error);
  }
};

// Create price alert notifications
export const createPriceAlertNotification = async (userId, crop, oldPrice, newPrice, region) => {
  try {
    const priceChange = ((newPrice - oldPrice) / oldPrice) * 100;
    const changeType = priceChange > 0 ? 'increased' : 'decreased';

    const payload = {
      title: 'Price Alert',
      message: `Price for ${crop} has ${changeType} by ${Math.abs(priceChange).toFixed(2)}% in ${region}`,
      crop,
      oldPrice,
      newPrice,
      priceChange: Math.abs(priceChange),
      region,
      action: 'view_market_trends'
    };

    await pool.query(
      `INSERT INTO notifications (user_id, type, payload, is_read)
       VALUES (?, ?, ?, ?)`,
      [userId, 'price_alert', JSON.stringify(payload), 0]
    );
  } catch (error) {
    console.error('Error creating price alert notification:', error);
  }
};

// Create listing-related notifications
export const createListingNotification = async (listingId, type, userId) => {
  try {
    let payload = {};
    let notificationType = '';

    switch (type) {
      case 'listing_favorited':
        notificationType = 'listing_update';
        payload = {
          title: 'Listing Favorited',
          message: 'Someone has added your listing to their favorites',
          listingId,
          action: 'view_listing'
        };
        break;
      case 'listing_expired':
        notificationType = 'listing_update';
        payload = {
          title: 'Listing Expired',
          message: 'Your listing has expired and is no longer visible to buyers',
          listingId,
          action: 'renew_listing'
        };
        break;
      default:
        return;
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, payload, is_read)
       VALUES (?, ?, ?, ?)`,
      [userId, notificationType, JSON.stringify(payload), 0]
    );
  } catch (error) {
    console.error('Error creating listing notification:', error);
  }
};
