import { pool } from "../config/db.js";

// Create a new review
export const createReview = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { listingId, rating, comment } = req.body;

    if (!listingId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Listing ID and valid rating (1-5) are required" });
    }

    // Get user ID and verify role (support dev tokens like other controllers)
    let userId, userRole;
    if (uid && uid.startsWith('dev-uid-')) {
      userId = req.user.id;
      userRole = req.user.role;
    } else {
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

    if (userRole !== 'buyer') {
      return res.status(403).json({ error: "Only buyers can create reviews" });
    }

    // Verify listing exists and user has ordered from it (via order_items)
    const [listings] = await pool.query(
      `SELECT l.*, o.id as order_id, o.status as order_status
       FROM produce_listings l
       JOIN order_items oi ON oi.listing_id = l.id
       JOIN orders o ON o.id = oi.order_id
       WHERE l.id = ? AND o.buyer_user_id = ? AND o.status = 'completed'`,
      [listingId, userId]
    );

    if (listings.length === 0) {
      return res.status(400).json({
        error: "You can only review listings you have purchased and completed"
      });
    }

    // Check if user already reviewed this listing
    const [existingReviews] = await pool.query(
      "SELECT id FROM reviews WHERE reviewer_user_id = ? AND listing_id = ?",
      [userId, listingId]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({ error: "You have already reviewed this listing" });
    }

    // Create review
    const [result] = await pool.query(
      `INSERT INTO reviews (
        reviewer_user_id, listing_id, rating, comment
      ) VALUES (?, ?, ?, ?)`,
      [userId, listingId, rating, comment || null]
    );

    // Note: Skipping aggregate updates because schema has no avg_rating/review_count columns

    res.status(201).json({
      id: result.insertId,
      message: "Review created successfully",
      review: {
        id: result.insertId,
        listingId,
        rating,
        comment
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: "Failed to create review" });
  }
};

// Get reviews for a listing
export const getListingReviews = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { page = 1, limit = 20, rating } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = "WHERE r.listing_id = ?";
    let params = [listingId];

    if (rating) {
      whereClause += " AND r.rating = ?";
      params.push(parseInt(rating));
    }

    // Get reviews with user info
    const [reviews] = await pool.query(
      `SELECT
        r.*,
        u.full_name as reviewer_name,
        NULL as reviewer_avatar,
        u.region as reviewer_region
       FROM reviews r
       JOIN users u ON r.reviewer_user_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM reviews r ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get rating distribution
    const [ratingDistribution] = await pool.query(
      `SELECT
        rating,
        COUNT(*) as count
       FROM reviews
       WHERE listing_id = ?
       GROUP BY rating
       ORDER BY rating DESC`,
      [listingId]
    );

    // Get listing average rating
    const [listingStats] = await pool.query(
      `SELECT
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews
       FROM reviews
       WHERE listing_id = ?`,
      [listingId]
    );

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      ratingDistribution,
      listingStats: listingStats[0] || {
        avg_rating: 0,
        total_reviews: 0
      }
    });
  } catch (error) {
    console.error('Error fetching listing reviews:', error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Get reviews for a farmer
export const getFarmerReviews = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { page = 1, limit = 20, rating } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = "WHERE l.farmer_user_id = ?";
    let params = [farmerId];

    if (rating) {
      whereClause += " AND r.rating = ?";
      params.push(parseInt(rating));
    }

    // Get reviews with listing and user info
    const [reviews] = await pool.query(
      `SELECT
        r.*,
        l.title as listing_title,
        l.crop as listing_crop,
        u.full_name as reviewer_name,
        NULL as reviewer_avatar,
        u.region as reviewer_region
       FROM reviews r
       JOIN produce_listings l ON r.listing_id = l.id
       JOIN users u ON r.reviewer_user_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total
       FROM reviews r
       JOIN produce_listings l ON r.listing_id = l.id
       ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get farmer rating statistics
    const [farmerStats] = await pool.query(
      `SELECT
        AVG(r.rating) as avg_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN r.rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN r.rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN r.rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star
       FROM reviews r
       JOIN produce_listings l ON r.listing_id = l.id
       WHERE l.farmer_user_id = ?`,
      [farmerId]
    );

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      farmerStats: farmerStats[0] || {
        avg_rating: 0,
        total_reviews: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      }
    });
  } catch (error) {
    console.error('Error fetching farmer reviews:', error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Valid rating (1-5) is required" });
    }

    // Get user ID (support dev tokens)
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

    // Verify review exists and belongs to user
    const [reviews] = await pool.query(
      "SELECT * FROM reviews WHERE id = ? AND reviewer_user_id = ?",
      [id, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: "Review not found or not authorized" });
    }

    const review = reviews[0];

    // Update review
    await pool.query(
      "UPDATE reviews SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [rating, comment || null, id]
    );

    // Note: Skipping aggregate updates because schema has no avg_rating/review_count columns

    res.json({ message: "Review updated successfully" });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: "Failed to update review" });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    // Get user ID (support dev tokens)
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

    // Verify review exists and belongs to user
    const [reviews] = await pool.query(
      "SELECT * FROM reviews WHERE id = ? AND reviewer_user_id = ?",
      [id, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: "Review not found or not authorized" });
    }

    const review = reviews[0];

    // Delete review
    await pool.query("DELETE FROM reviews WHERE id = ?", [id]);

    // Note: Skipping aggregate updates because schema has no avg_rating/review_count columns

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { page = 1, limit = 20 } = req.query;

    // Get user ID (support dev tokens)
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
    const offset = (page - 1) * limit;

    // Get user's reviews with listing info
    const [reviews] = await pool.query(
      `SELECT
        r.*,
        l.title as listing_title,
        l.crop as listing_crop,
        NULL as listing_image,
        u.full_name as farmer_name,
        u.region as farmer_region
       FROM reviews r
       JOIN produce_listings l ON r.listing_id = l.id
       JOIN users u ON l.farmer_user_id = u.id
       WHERE r.reviewer_user_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.query(
      "SELECT COUNT(*) as total FROM reviews WHERE reviewer_user_id = ?",
      [userId]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get user's review statistics
    const [userStats] = await pool.query(
      `SELECT
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews
       WHERE reviewer_user_id = ?`,
      [userId]
    );

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      userStats: userStats[0] || {
        total_reviews: 0,
        avg_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Get review statistics for admin
export const getReviewStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === 'month') {
      dateFilter = "AND r.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    } else if (period === 'quarter') {
      dateFilter = "AND r.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
    } else if (period === 'year') {
      dateFilter = "AND r.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
    }

    // Get overall review statistics
    const [overallStats] = await pool.query(
      `SELECT
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews r
       WHERE 1=1 ${dateFilter}`
    );

    // Get review trends over time
    const [reviewTrends] = await pool.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as review_count,
        AVG(rating) as avg_rating
       FROM reviews
       WHERE 1=1 ${dateFilter}
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`
    );

    // Get top reviewed crops
    const [topCrops] = await pool.query(
      `SELECT
        l.crop,
        COUNT(r.id) as review_count,
        AVG(r.rating) as avg_rating
       FROM reviews r
       JOIN produce_listings l ON r.listing_id = l.id
       WHERE 1=1 ${dateFilter}
       GROUP BY l.crop
       ORDER BY review_count DESC
       LIMIT 10`
    );

    res.json({
      period,
      overallStats: overallStats[0] || {
        total_reviews: 0,
        avg_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      },
      reviewTrends,
      topCrops
    });
  } catch (error) {
    console.error('Error getting review statistics:', error);
    res.status(500).json({ error: "Failed to get review statistics" });
  }
};

