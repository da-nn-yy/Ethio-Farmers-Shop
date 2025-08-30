import { pool } from "../config/database.js";

// Get comprehensive farmer dashboard metrics
export const getFarmerMetrics = async (req, res) => {
  try {
    const farmerId = req.user.uid;

    // Get active listings count
    const [listingsResult] = await pool.query(
      "SELECT COUNT(*) as count FROM produce_listings WHERE farmer_id = (SELECT id FROM users WHERE firebase_uid = ?) AND status = 'active'",
      [farmerId]
    );

    // Get pending orders count
    const [pendingOrdersResult] = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE farmer_id = (SELECT id FROM users WHERE firebase_uid = ?) AND status = 'pending'",
      [farmerId]
    );

    // Get weekly earnings (last 7 days)
    const [earningsResult] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE farmer_id = (SELECT id FROM users WHERE firebase_uid = ?) AND status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
      [farmerId]
    );

    // Get total reviews count
    const [reviewsResult] = await pool.query(
      "SELECT COUNT(*) as count FROM reviews WHERE farmer_id = (SELECT id FROM users WHERE firebase_uid = ?)",
      [farmerId]
    );

    // Calculate trends (compare with previous week)
    const [previousWeekEarnings] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE farmer_id = (SELECT id FROM users WHERE firebase_uid = ?) AND status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)",
      [farmerId]
    );

    const currentEarnings = earningsResult[0].total || 0;
    const previousEarnings = previousWeekEarnings[0].total || 0;
    const earningsTrend = previousEarnings > 0 ? ((currentEarnings - previousEarnings) / previousEarnings) * 100 : 0;

    const metrics = [
      {
        title: "Active Listings",
        titleAm: "ንቁ ዝርዝሮች",
        value: listingsResult[0].count || 0,
        icon: "Package",
        trend: "up",
        trendValue: 8.5
      },
      {
        title: "Pending Orders",
        titleAm: "በመጠባበቅ ላይ ያሉ ትዕዛዞች",
        value: pendingOrdersResult[0].count || 0,
        icon: "ShoppingBag",
        trend: "up",
        trendValue: 12.3
      },
      {
        title: "Weekly Earnings",
        titleAm: "ሳምንታዊ ገቢ",
        value: currentEarnings,
        icon: "TrendingUp",
        currency: true,
        trend: earningsTrend > 0 ? "up" : "down",
        trendValue: Math.abs(earningsTrend)
      },
      {
        title: "Total Reviews",
        titleAm: "ጠቅላላ ግምገማዎች",
        value: reviewsResult[0].count || 0,
        icon: "Star",
        trend: "up",
        trendValue: 4.2
      }
    ];

    res.json(metrics);
  } catch (error) {
    console.error("Error fetching farmer metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};

// Get farmer's active produce listings
export const getFarmerListings = async (req, res) => {
  try {
    const farmerId = req.user.uid;
    const limit = parseInt(req.query.limit) || 10;

    const [listings] = await pool.query(
      `SELECT
        pl.id,
        pl.name,
        pl.name_am,
        pl.image_url,
        pl.price_per_kg,
        pl.available_quantity,
        pl.location,
        pl.status,
        pl.created_at
      FROM produce_listings pl
      JOIN users u ON pl.farmer_id = u.id
      WHERE u.firebase_uid = ?
      ORDER BY pl.created_at DESC
      LIMIT ?`,
      [farmerId, limit]
    );

    // Transform data to match frontend expectations
    const transformedListings = listings.map(listing => ({
      id: listing.id,
      name: listing.name,
      nameAm: listing.name_am,
      image: listing.image_url || "https://images.pexels.com/photos/4110404/pexels-photo-4110404.jpeg",
      pricePerKg: listing.price_per_kg,
      availableQuantity: listing.available_quantity,
      location: listing.location,
      status: listing.status,
      createdAt: listing.created_at
    }));

    res.json(transformedListings);
  } catch (error) {
    console.error("Error fetching farmer listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

// Get farmer's orders with status filtering
export const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.uid;
    const status = req.query.status; // optional filter by status

    let query = `
      SELECT
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        o.notes,
        u.full_name as buyer_name,
        u.phone as buyer_phone,
        u.region as buyer_region
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      JOIN users f ON o.farmer_id = f.id
      WHERE f.firebase_uid = ?
    `;

    const params = [farmerId];

    if (status) {
      query += " AND o.status = ?";
      params.push(status);
    }

    query += " ORDER BY o.created_at DESC LIMIT 20";

    const [orders] = await pool.query(query, params);

    res.json(orders);
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get recent activity feed for farmer
export const getFarmerRecentActivity = async (req, res) => {
  try {
    const farmerId = req.user.uid;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent orders, reviews, and listing updates
    const [activities] = await pool.query(
      `(SELECT
        'order' as type,
        o.created_at as timestamp,
        CONCAT('New order received from ', u.full_name) as message,
        CONCAT('አዲስ ትዕዛዝ ከ', u.full_name, ' ደርሷል') as message_am,
        o.id as reference_id
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      JOIN users f ON o.farmer_id = f.id
      WHERE f.firebase_uid = ?)
      UNION ALL
      (SELECT
        'review' as type,
        r.created_at as timestamp,
        CONCAT('New review received: ', r.rating, ' stars') as message,
        CONCAT('አዲስ ግምገማ ደርሷል: ', r.rating, ' ኮከቦች') as message_am,
        r.id as reference_id
      FROM reviews r
      JOIN users f ON r.farmer_id = f.id
      WHERE f.firebase_uid = ?)
      ORDER BY timestamp DESC
      LIMIT ?`,
      [farmerId, farmerId, limit]
    );

    res.json(activities);
  } catch (error) {
    console.error("Error fetching farmer activity:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
};

// Create new produce listing for farmer
export const createFarmerListing = async (req, res) => {
  try {
    const farmerId = req.user.uid;
    const {
      name,
      nameAm,
      description,
      descriptionAm,
      category,
      pricePerKg,
      availableQuantity,
      location,
      image
    } = req.body;

    // Validate required fields
    if (!name || !category || !pricePerKg || !availableQuantity || !location) {
      return res.status(400).json({
        error: "Missing required fields: name, category, pricePerKg, availableQuantity, location"
      });
    }

    // Get farmer's database ID from firebase_uid
    const [farmerRows] = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = ?',
      [farmerId]
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    const farmerDbId = farmerRows[0].id;

    // Create the listing
    const [result] = await pool.query(
      `INSERT INTO produce_listings (
        farmer_id,
        name,
        name_am,
        description,
        description_am,
        category,
        price_per_kg,
        available_quantity,
        location,
        image_url,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        farmerDbId,
        name,
        nameAm || null,
        description || null,
        descriptionAm || null,
        category,
        pricePerKg,
        availableQuantity,
        location,
        image || null
      ]
    );

    const listingId = result.insertId;

    // Get the created listing with all details
    const [listingRows] = await pool.query(
      `SELECT
        pl.id,
        pl.name,
        pl.name_am as nameAm,
        pl.description,
        pl.description_am as descriptionAm,
        pl.category,
        pl.price_per_kg as pricePerKg,
        pl.available_quantity as availableQuantity,
        pl.location,
        pl.image_url as image,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt
      FROM produce_listings pl
      WHERE pl.id = ?`,
      [listingId]
    );

    if (listingRows.length === 0) {
      return res.status(500).json({ error: "Failed to retrieve created listing" });
    }

    const createdListing = listingRows[0];

    res.status(201).json(createdListing);
  } catch (error) {
    console.error("Error creating farmer listing:", error);
    res.status(500).json({ error: "Failed to create listing" });
  }
};
