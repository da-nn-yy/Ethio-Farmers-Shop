import { pool } from '../config/database.js';

// Get all users for admin management
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (role && role !== 'all') {
      whereClause += ' AND role = ?';
      params.push(role);
    }
    
    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      whereClause += ' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Get users with pagination
    const [users] = await pool.query(
      `SELECT 
        u.*,
        (SELECT COUNT(*) FROM produce_listings WHERE farmer_user_id = u.id) as listing_count,
        (SELECT COUNT(*) FROM orders WHERE buyer_user_id = u.id OR farmer_user_id = u.id) as order_count,
        (SELECT AVG(rating) FROM reviews r JOIN produce_listings l ON r.listing_id = l.id WHERE l.farmer_user_id = u.id) as avg_rating
       FROM users u 
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params
    );
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Update user status (suspend, activate, etc.)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;
    
    await pool.query(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, userId]
    );
    
    // Log the action
    await pool.query(
      `INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details, created_at)
       VALUES (?, 'user_status_update', 'user', ?, ?, CURRENT_TIMESTAMP)`,
      [req.user.id, userId, JSON.stringify({ status, reason })]
    );
    
    res.json({ success: true, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: "Failed to update user status" });
  }
};

// Get all listings for admin management
export const getAllListings = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, category, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (status && status !== 'all') {
      whereClause += ' AND l.status = ?';
      params.push(status);
    }
    
    if (category && category !== 'all') {
      whereClause += ' AND l.crop = ?';
      params.push(category);
    }
    
    if (search) {
      whereClause += ' AND (l.title LIKE ? OR l.description LIKE ? OR u.full_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const [listings] = await pool.query(
      `SELECT 
        l.*,
        u.full_name as farmer_name,
        u.email as farmer_email,
        u.region as farmer_region,
        (SELECT COUNT(*) FROM order_items WHERE listing_id = l.id) as order_count,
        (SELECT AVG(rating) FROM reviews WHERE listing_id = l.id) as avg_rating
       FROM produce_listings l
       JOIN users u ON l.farmer_user_id = u.id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM produce_listings l JOIN users u ON l.farmer_user_id = u.id ${whereClause}`,
      params
    );
    
    res.json({
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

// Update listing status (approve, reject, suspend)
export const updateListingStatus = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { status, reason } = req.body;
    
    await pool.query(
      'UPDATE produce_listings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, listingId]
    );
    
    // Log the action
    await pool.query(
      `INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details, created_at)
       VALUES (?, 'listing_status_update', 'listing', ?, ?, CURRENT_TIMESTAMP)`,
      [req.user.id, listingId, JSON.stringify({ status, reason })]
    );
    
    res.json({ success: true, message: 'Listing status updated successfully' });
  } catch (error) {
    console.error('Error updating listing status:', error);
    res.status(500).json({ error: "Failed to update listing status" });
  }
};

// Get all orders for admin management
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (status && status !== 'all') {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }
    
    if (dateFrom) {
      whereClause += ' AND DATE(o.created_at) >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      whereClause += ' AND DATE(o.created_at) <= ?';
      params.push(dateTo);
    }
    
    const [orders] = await pool.query(
      `SELECT 
        o.*,
        buyer.full_name as buyer_name,
        buyer.email as buyer_email,
        farmer.full_name as farmer_name,
        farmer.email as farmer_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       JOIN users buyer ON o.buyer_user_id = buyer.id
       JOIN users farmer ON o.farmer_user_id = farmer.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    );
    
    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get admin analytics data
export const getAdminAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case '7d':
        dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        break;
      case '30d':
        dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        break;
      case '90d':
        dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
        break;
      case '1y':
        dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
        break;
    }
    
    // Revenue analytics
    const [revenueData] = await pool.query(
      `SELECT
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        COUNT(*) as order_count,
        SUM(total) as total_revenue,
        AVG(total) as avg_order_value
       FROM orders
       WHERE status = 'completed' ${dateFilter}
       GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
       ORDER BY date`
    );
    
    // User growth analytics
    const [userGrowth] = await pool.query(
      `SELECT
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        COUNT(CASE WHEN role = 'farmer' THEN 1 END) as farmers,
        COUNT(CASE WHEN role = 'buyer' THEN 1 END) as buyers,
        COUNT(*) as total_users
       FROM users
       WHERE 1=1 ${dateFilter}
       GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
       ORDER BY date`
    );
    
    // Category performance
    const [categoryPerformance] = await pool.query(
      `SELECT
        l.crop as category,
        COUNT(DISTINCT l.id) as listing_count,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity) as total_quantity_sold,
        AVG(l.price_per_unit) as avg_price,
        SUM(o.total) as total_revenue
       FROM produce_listings l
       LEFT JOIN order_items oi ON l.id = oi.listing_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
       WHERE l.status = 'active' ${dateFilter}
       GROUP BY l.crop
       ORDER BY total_revenue DESC
       LIMIT 10`
    );
    
    // Top performing farmers
    const [topFarmers] = await pool.query(
      `SELECT
        u.full_name as farmer_name,
        u.region,
        COUNT(DISTINCT l.id) as listing_count,
        COUNT(DISTINCT o.id) as order_count,
        SUM(o.total) as total_revenue,
        AVG(r.rating) as avg_rating
       FROM users u
       JOIN produce_listings l ON u.id = l.farmer_user_id
       LEFT JOIN order_items oi ON l.id = oi.listing_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
       LEFT JOIN reviews r ON l.id = r.listing_id
       WHERE u.role = 'farmer' ${dateFilter}
       GROUP BY u.id, u.full_name, u.region
       ORDER BY total_revenue DESC
       LIMIT 10`
    );
    
    res.json({
      revenue: {
        total: revenueData.reduce((sum, item) => sum + item.total_revenue, 0),
        growth: 0, // Calculate growth percentage
        chart: revenueData
      },
      users: {
        total: userGrowth.reduce((sum, item) => sum + item.total_users, 0),
        growth: 0, // Calculate growth percentage
        chart: userGrowth
      },
      categoryPerformance,
      topFarmers
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};

// Get system settings
export const getSystemSettings = async (req, res) => {
  try {
    const [settings] = await pool.query(
      'SELECT * FROM system_settings ORDER BY category, setting_key'
    );
    
    const groupedSettings = {};
    settings.forEach(setting => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = {};
      }
      groupedSettings[setting.category][setting.setting_key] = setting.setting_value;
    });
    
    res.json(groupedSettings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: "Failed to fetch system settings" });
  }
};

// Update system settings
export const updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    for (const [category, categorySettings] of Object.entries(settings)) {
      for (const [key, value] of Object.entries(categorySettings)) {
        await pool.query(
          `INSERT INTO system_settings (category, setting_key, setting_value, updated_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = VALUES(updated_at)`,
          [category, key, JSON.stringify(value)]
        );
      }
    }
    
    // Log the action
    await pool.query(
      `INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details, created_at)
       VALUES (?, 'settings_update', 'system', NULL, ?, CURRENT_TIMESTAMP)`,
      [req.user.id, JSON.stringify(settings)]
    );
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ error: "Failed to update system settings" });
  }
};

// Get admin audit logs
export const getAdminAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, actionType, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (actionType && actionType !== 'all') {
      whereClause += ' AND action_type = ?';
      params.push(actionType);
    }
    
    if (dateFrom) {
      whereClause += ' AND DATE(created_at) >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      whereClause += ' AND DATE(created_at) <= ?';
      params.push(dateTo);
    }
    
    const [logs] = await pool.query(
      `SELECT 
        aa.*,
        u.full_name as admin_name
       FROM admin_actions aa
       LEFT JOIN users u ON aa.admin_id = u.id
       ${whereClause}
       ORDER BY aa.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM admin_actions aa ${whereClause}`,
      params
    );
    
    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};
