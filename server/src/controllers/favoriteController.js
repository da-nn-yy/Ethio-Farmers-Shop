import { pool } from '../config/database.js';
import { createListingNotification } from './notificationController.js';

async function ensureFavoritesTable() {
  // Create favorites table if missing (idempotent)
  await pool.query(`CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    buyer_user_id BIGINT NOT NULL,
    listing_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_fav_buyer_listing (buyer_user_id, listing_id),
    INDEX idx_fav_buyer (buyer_user_id),
    INDEX idx_fav_listing (listing_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

// Add a listing to favorites
export const addToFavorites = async (req, res) => {
  try {
    await ensureFavoritesTable();
    const uid = req.user.uid;
    const { listingId, listing_id } = req.body;

    // Accept both camelCase and snake_case
    const finalListingId = listingId || listing_id;

    if (!finalListingId) {
      return res.status(400).json({ error: "Listing ID is required" });
    }

    // Get user ID and verify role
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
        // Auto-create buyer profile if missing to avoid 404 on first action
        const [insert] = await pool.query(
          "INSERT INTO users (firebase_uid, role) VALUES (?, 'buyer')",
          [uid]
        );
        userId = insert.insertId;
        userRole = 'buyer';
      } else {
        userId = userRows[0].id;
        userRole = userRows[0].role;
      }
    }

    if (userRole !== 'buyer') {
      return res.status(403).json({ error: "Only buyers can add favorites" });
    }

    // Verify listing exists and is active
    const [listings] = await pool.query(
      "SELECT id, status FROM produce_listings WHERE id = ?",
      [finalListingId]
    );

    if (listings.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listings[0].status !== 'active') {
      return res.status(400).json({ error: "Cannot favorite inactive listing" });
    }

    // Check if already favorited
    const [existing] = await pool.query(
      "SELECT id FROM favorites WHERE buyer_user_id = ? AND listing_id = ?",
      [userId, finalListingId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Listing already in favorites" });
    }

    // Add to favorites
    await pool.query(
      "INSERT INTO favorites (buyer_user_id, listing_id) VALUES (?, ?)",
      [userId, finalListingId]
    );

    // Notify the listing's farmer their listing was favorited (best-effort)
    try {
      const [farmerRows] = await pool.query(
        'SELECT farmer_user_id FROM produce_listings WHERE id = ? LIMIT 1',
        [finalListingId]
      );
      if (farmerRows.length > 0 && farmerRows[0].farmer_user_id) {
        await createListingNotification(finalListingId, 'listing_favorited', farmerRows[0].farmer_user_id);
      }
    } catch (_) {}

    res.status(201).json({ message: "Added to favorites successfully" });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: "Failed to add to favorites" });
  }
};

// Remove a listing from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    await ensureFavoritesTable();
    const uid = req.user.uid;
    const { listingId } = req.params;

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

    // Remove from favorites
    const [result] = await pool.query(
      "DELETE FROM favorites WHERE buyer_user_id = ? AND listing_id = ?",
      [userId, listingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.json({ message: "Removed from favorites successfully" });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: "Failed to remove from favorites" });
  }
};

// Get user's favorite listings
export const getFavoriteListings = async (req, res) => {
  try {
    await ensureFavoritesTable();
    const uid = req.user.uid;
    const { page = 1, limit = 20 } = req.query;

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
    const offset = (page - 1) * limit;

    // Get favorite listings with details
    const [favorites] = await pool.query(
      `SELECT
        f.id as favorite_id,
        f.created_at as favorited_at,
        l.*,
        u.full_name as farmer_name,
        u.phone as farmer_phone,
        u.region as farmer_region,
        u.woreda as farmer_woreda,
        fp.farm_name,
        fp.experience_years,
        fp.certifications
      FROM favorites f
      JOIN produce_listings l ON f.listing_id = l.id
      JOIN users u ON l.farmer_user_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE f.buyer_user_id = ? AND l.status = 'active'
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total
       FROM favorites f
       JOIN produce_listings l ON f.listing_id = l.id
       WHERE f.buyer_user_id = ? AND l.status = 'active'`,
      [userId]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      favorites,
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
    console.error('Error fetching favorite listings:', error);
    res.status(500).json({ error: "Failed to fetch favorite listings" });
  }
};

// Check if a listing is favorited by user
export const checkFavoriteStatus = async (req, res) => {
  try {
    await ensureFavoritesTable();
    const uid = req.user.uid;
    const { listingId } = req.params;

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

    // Check favorite status
    const [favorites] = await pool.query(
      "SELECT id FROM favorites WHERE buyer_user_id = ? AND listing_id = ?",
      [userId, listingId]
    );

    res.json({
      isFavorited: favorites.length > 0,
      favoriteId: favorites.length > 0 ? favorites[0].id : null
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ error: "Failed to check favorite status" });
  }
};

// Get favorite farmers (users who have listings favorited by the buyer)
export const getFavoriteFarmers = async (req, res) => {
  try {
    await ensureFavoritesTable();
    const uid = req.user.uid;
    const { page = 1, limit = 20 } = req.query;

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
    const offset = (page - 1) * limit;

    // Get favorite farmers with their details
    const [favoriteFarmers] = await pool.query(
      `SELECT DISTINCT
        u.id as farmer_id,
        u.full_name as farmer_name,
        u.phone as farmer_phone,
        u.region as farmer_region,
        u.woreda as farmer_woreda,
        fp.farm_name,
        fp.experience_years,
        fp.certifications,
        fp.crops,
        COUNT(f.id) as favorited_listings_count,
        MAX(f.created_at) as last_favorited
      FROM favorites f
      JOIN produce_listings l ON f.listing_id = l.id
      JOIN users u ON l.farmer_user_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE f.buyer_user_id = ? AND l.status = 'active'
      GROUP BY u.id, u.full_name, u.phone, u.region, u.woreda, fp.farm_name, fp.experience_years, fp.certifications, fp.crops
      ORDER BY last_favorited DESC
      LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(DISTINCT u.id) as total
       FROM favorites f
       JOIN produce_listings l ON f.listing_id = l.id
       JOIN users u ON l.farmer_user_id = u.id
       WHERE f.buyer_user_id = ? AND l.status = 'active'`,
      [userId]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      favoriteFarmers,
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
    console.error('Error fetching favorite farmers:', error);
    res.status(500).json({ error: "Failed to fetch favorite farmers" });
  }
};

// Get favorite statistics for a user
export const getFavoriteStats = async (req, res) => {
  try {
    const uid = req.user.uid;

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

    // Get favorite statistics
    const [stats] = await pool.query(
      `SELECT
        COUNT(*) as total_favorites,
        COUNT(DISTINCT l.farmer_user_id) as unique_farmers,
        COUNT(DISTINCT l.crop) as unique_crops,
        MAX(f.created_at) as last_favorited
      FROM favorites f
      JOIN produce_listings l ON f.listing_id = l.id
      WHERE f.buyer_user_id = ? AND l.status = 'active'`,
      [userId]
    );

    // Get favorite crops breakdown
    const [cropBreakdown] = await pool.query(
      `SELECT
        l.crop,
        COUNT(*) as favorite_count
      FROM favorites f
      JOIN produce_listings l ON f.listing_id = l.id
      WHERE f.buyer_user_id = ? AND l.status = 'active'
      GROUP BY l.crop
      ORDER BY favorite_count DESC
      LIMIT 10`,
      [userId]
    );

    // Get recent favorites
    const [recentFavorites] = await pool.query(
      `SELECT
        f.created_at as favorited_at,
        l.title,
        l.crop,
        l.price_per_unit,
        l.currency
      FROM favorites f
      JOIN produce_listings l ON f.listing_id = l.id
      WHERE f.buyer_user_id = ? AND l.status = 'active'
      ORDER BY f.created_at DESC
      LIMIT 5`,
      [userId]
    );

    res.json({
      stats: stats[0] || {
        total_favorites: 0,
        unique_farmers: 0,
        unique_crops: 0,
        last_favorited: null
      },
      cropBreakdown,
      recentFavorites
    });
  } catch (error) {
    console.error('Error fetching favorite stats:', error);
    res.status(500).json({ error: "Failed to fetch favorite statistics" });
  }
};

// Bulk add/remove favorites
export const bulkUpdateFavorites = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { action, listingIds } = req.body;

    if (!action || !listingIds || !Array.isArray(listingIds)) {
      return res.status(400).json({ error: "Action and listing IDs array are required" });
    }

    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: "Action must be 'add' or 'remove'" });
    }

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

    if (action === 'add') {
      // Add multiple favorites
      const values = listingIds.map(listingId => [userId, listingId]);

      // Use INSERT IGNORE to skip duplicates
      await pool.query(
        "INSERT IGNORE INTO favorites (buyer_user_id, listing_id) VALUES ?",
        [values]
      );

      res.json({ message: "Favorites added successfully" });
    } else {
      // Remove multiple favorites
      const placeholders = listingIds.map(() => '?').join(',');
      await pool.query(
        `DELETE FROM favorites WHERE buyer_user_id = ? AND listing_id IN (${placeholders})`,
        [userId, ...listingIds]
      );

      res.json({ message: "Favorites removed successfully" });
    }
  } catch (error) {
    console.error('Error bulk updating favorites:', error);
    res.status(500).json({ error: "Failed to bulk update favorites" });
  }
};

