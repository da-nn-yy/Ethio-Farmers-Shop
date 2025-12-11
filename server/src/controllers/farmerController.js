import { pool } from '../config/database.js';

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

function normalizeImageUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  const url = String(rawUrl).replace(/\\/g, '/');
  if (/^https?:\/\//i.test(url)) return url;
  const trimmed = url.replace(/^\/?/, '');
  return `${PUBLIC_BASE_URL}/${trimmed}`;
}

// Detect if a column exists on a table in the current database
async function columnExists(tableName, columnName) {
  const [rows] = await pool.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

// Get comprehensive farmer dashboard metrics
export const getFarmerMetrics = async (req, res) => {
  try {
    const farmerId = req.user.uid;

    // Get active listings count
    let listingsCount = 0;
    try {
      const hasNewSchema = await columnExists('produce_listings', 'farmer_user_id');
      const query = hasNewSchema
        ? "SELECT COUNT(*) as count FROM produce_listings pl JOIN users u ON pl.farmer_user_id = u.id WHERE u.firebase_uid = ? AND pl.status = 'active'"
        : "SELECT COUNT(*) as count FROM produce_listings pl JOIN users u ON pl.farmer_id = u.id WHERE u.firebase_uid = ? AND pl.status = 'active'";
      const [r] = await pool.query(query, [farmerId]);
      listingsCount = r[0]?.count || 0;
    } catch (_) {}

    // Get pending orders count
    let pendingOrders = 0;
    try {
      const [r] = await pool.query(
        "SELECT COUNT(*) as count FROM orders o JOIN users u ON o.farmer_user_id = u.id WHERE u.firebase_uid = ? AND o.status = 'pending'",
        [farmerId]
      );
      pendingOrders = r[0]?.count || 0;
    } catch (_) {}

    // Get weekly earnings (last 7 days)
    let earningsTotal = 0;
    try {
      const [r] = await pool.query(
        "SELECT COALESCE(SUM(o.total), 0) as total FROM orders o JOIN users u ON o.farmer_user_id = u.id WHERE u.firebase_uid = ? AND o.status = 'completed' AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
        [farmerId]
      );
      earningsTotal = r[0]?.total || 0;
    } catch (_) {}

    // Get total reviews count (if you have a reviews table)
    let reviewsCount = 0;
    try {
      const [r] = await pool.query(
        "SELECT COUNT(*) as count FROM notifications n JOIN users u ON n.user_id = u.id WHERE u.firebase_uid = ? AND n.type = 'review'",
        [farmerId]
      );
      reviewsCount = r[0]?.count || 0;
    } catch (_) {}

    // Calculate trends (compare with previous week)
    let previousEarningsTotal = 0;
    try {
      const [r] = await pool.query(
        "SELECT COALESCE(SUM(o.total), 0) as total FROM orders o JOIN users u ON o.farmer_user_id = u.id WHERE u.firebase_uid = ? AND o.status = 'completed' AND o.created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND o.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)",
        [farmerId]
      );
      previousEarningsTotal = r[0]?.total || 0;
    } catch (_) {}

    const currentEarnings = earningsTotal;
    const previousEarnings = previousEarningsTotal;
    const earningsTrend = previousEarnings > 0 ? ((currentEarnings - previousEarnings) / previousEarnings) * 100 : 0;

    const metrics = [
      {
        title: "Active Listings",
        titleAm: "ንቁ ዝርዝሮች",
        value: listingsCount,
        icon: "Package",
        trend: "up",
        trendValue: 8.5
      },
      {
        title: "Pending Orders",
        titleAm: "በመጠባበቅ ላይ ያሉ ትዕዛዞች",
        value: pendingOrders,
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
        value: reviewsCount,
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
    const status = req.query.status; // Filter by status

    // Choose query based on available columns (support legacy and new schemas)
    const hasNewFarmerCol = await columnExists('produce_listings', 'farmer_user_id');
    const hasTitleCol = await columnExists('produce_listings', 'title');
    const hasPricePerUnit = await columnExists('produce_listings', 'price_per_unit');

    // Build WHERE clause with status filter
    let whereClause = "WHERE u.firebase_uid = ?";
    const params = [farmerId];

    if (status) {
      whereClause += " AND pl.status = ?";
      params.push(status);
    }

    params.push(limit);

    const query = hasNewFarmerCol && hasTitleCol && hasPricePerUnit
      ? `SELECT
          pl.id,
          pl.title as name,
          pl.crop as category,
          pl.price_per_unit as pricePerUnit,
          pl.quantity as quantity,
          pl.unit,
          pl.region,
          pl.woreda,
          pl.description,
          pl.status,
          pl.created_at
        FROM produce_listings pl
        JOIN users u ON pl.farmer_user_id = u.id
        ${whereClause}
        ORDER BY pl.created_at DESC
        LIMIT ?`
      : `SELECT
          pl.id,
          pl.name,
          pl.name_am,
          pl.category,
          pl.price_per_kg as pricePerUnit,
          pl.available_quantity as quantity,
          pl.unit,
          pl.location as region,
          pl.description,
          pl.status,
          pl.created_at,
          pl.image_url as image
        FROM produce_listings pl
        JOIN users u ON pl.farmer_id = u.id
        ${whereClause}
        ORDER BY pl.created_at DESC
        LIMIT ?`;

    const [listings] = await pool.query(query, params);

    // Get all images for these listings (only for new schema)
    let imagesByListing = {};
    if (hasNewFarmerCol && hasTitleCol && hasPricePerUnit) {
      const listingIds = listings.map(l => l.id);

      if (listingIds.length > 0) {
        const imagesQuery = `
          SELECT listing_id, url, sort_order
          FROM listing_images
          WHERE listing_id IN (${listingIds.map(() => '?').join(',')})
          ORDER BY listing_id, sort_order
        `;

        const [imageRows] = await pool.query(imagesQuery, listingIds);

        // Group images by listing_id and normalize URL
        imageRows.forEach(img => {
          if (!imagesByListing[img.listing_id]) {
            imagesByListing[img.listing_id] = [];
          }
          imagesByListing[img.listing_id].push(normalizeImageUrl(img.url));
        });
      }
    }

    console.log('Retrieved farmer listings with images:', listings.map(l => ({
      id: l.id,
      name: l.name || l.title,
      image: l.image
    })));

    console.log('Images by listing:', imagesByListing);

    // Transform data to match frontend expectations
    const statusMapOut = {
      sold: 'sold_out',
      paused: 'inactive',
      active: 'active',
      expired: 'inactive',
      draft: 'draft',
      inactive: 'inactive'
    };
    const transformedListings = listings.map(listing => {
      const listingImages = imagesByListing[listing.id] || [];
      return {
        id: listing.id,
        name: listing.name, // Selected as alias in query
        nameAm: null, // No name_am column in current schema
        description: listing.description || null,
        image: listingImages[0] || null,
        images: listingImages, // All images
        pricePerKg: listing.pricePerUnit,
        availableQuantity: listing.quantity,
        location: listing.woreda ? `${listing.region}, ${listing.woreda}` : (listing.region || ''),
        status: statusMapOut[listing.status] || listing.status,
        createdAt: listing.created_at,
        category: listing.crop, // Use crop since that's what exists in the schema
        unit: listing.unit,
        currency: 'ETB'
      };
    });

    console.log('Transformed farmer listings:', transformedListings.map(l => ({
      id: l.id,
      name: l.name,
      image: l.image
    })));

    res.json({ listings: transformedListings });
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

    // Get recent orders only (skip reviews for now since table doesn't exist)
    const [activities] = await pool.query(
      `SELECT
        'order' as type,
        o.created_at as timestamp,
        CONCAT('New order received from ', u.full_name) as message,
        CONCAT('አዲስ ትዕዛዝ ከ', u.full_name, ' ደርሷል') as message_am,
        o.id as reference_id
      FROM orders o
      JOIN users u ON o.buyer_user_id = u.id
      JOIN users f ON o.farmer_user_id = f.id
      WHERE f.firebase_uid = ?
      ORDER BY o.created_at DESC
      LIMIT ?`,
      [farmerId, limit]
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
      image,
      status = 'active' // Default to active, can be 'draft'
    } = req.body;

    // Debug logging
    console.log('Creating farmer listing with data:', {
      farmerId,
      name,
      category,
      pricePerKg,
      availableQuantity,
      location,
      status
    });

    // Validate required fields (relaxed for drafts)
    if (status !== 'draft' && (!name || !category || !pricePerKg || !availableQuantity || !location)) {
      return res.status(400).json({
        error: "Missing required fields: name, category, pricePerKg, availableQuantity, location"
      });
    }

    // Validate status
    const validStatuses = ['active', 'draft'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // For development/testing, create user if doesn't exist
    let farmerDbId;
    try {
      const [farmerRows] = await pool.query(
        'SELECT id FROM users WHERE firebase_uid = ?',
        [farmerId]
      );

      if (farmerRows.length === 0) {
        console.log('User not found, creating development user for farmerId:', farmerId);
        // Create user for development
        const [newUserResult] = await pool.query(
          'INSERT INTO users (firebase_uid, role, full_name, phone, email, region, woreda) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [farmerId, 'farmer', 'Development Farmer', '+251900000000', 'dev@example.com', 'Addis Ababa', 'Development Area']
        );
        farmerDbId = newUserResult.insertId;

        // Create farmer profile
        await pool.query(
          'INSERT INTO farmer_profiles (user_id, farm_name, farm_size_ha, experience_years, address) VALUES (?, ?, ?, ?, ?)',
          [farmerDbId, 'Development Farm', 5.0, 3, 'Addis Ababa, Ethiopia']
        );
        console.log('Created new user and farmer profile with ID:', farmerDbId);
      } else {
        farmerDbId = farmerRows[0].id;
        console.log('Found existing user with ID:', farmerDbId);
      }
    } catch (dbError) {
      console.error('Database error while finding/creating user:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Create the listing (support both new and legacy schemas)
    let result;
    let useNewSchema = false;
    try {
      useNewSchema = await columnExists('produce_listings', 'farmer_user_id');
      console.log('Using schema:', useNewSchema ? 'new' : 'legacy');

      if (useNewSchema) {
        console.log('Inserting with new schema...');
        const safeQuantity = status === 'draft' ? Math.max(1, Number(availableQuantity) || 1) : (Number(availableQuantity) || 0);
        const safePrice = status === 'draft' ? Math.max(0.01, Number(pricePerKg) || 0.01) : (Number(pricePerKg) || 0);
        [result] = await pool.query(
          `INSERT INTO produce_listings (
            farmer_user_id,
            title,
            crop,
            variety,
            quantity,
            unit,
            price_per_unit,
            currency,
            available_from,
            available_until,
            region,
            woreda,
            description,
            status
          ) VALUES (?, ?, ?, NULL, ?, ?, ?, 'ETB', NULL, NULL, ?, NULL, ?, ?)`,
          [
            farmerDbId,
            name || 'Draft Listing',
            category || 'Other',
            safeQuantity,
            'kg',
            safePrice,
            location || 'Addis Ababa',
            description || null,
            status
          ]
        );
      } else {
        console.log('Inserting with legacy schema...');
        const safeQuantity = status === 'draft' ? Math.max(1, Number(availableQuantity) || 1) : (Number(availableQuantity) || 0);
        const safePrice = status === 'draft' ? Math.max(0.01, Number(pricePerKg) || 0.01) : (Number(pricePerKg) || 0);
        [result] = await pool.query(
          `INSERT INTO produce_listings (
            farmer_id,
            name,
            name_am,
            category,
            price_per_kg,
            available_quantity,
            unit,
            location,
            description,
            status,
            created_at
          ) VALUES (?, ?, NULL, ?, ?, ?, 'kg', ?, ?, ?, NOW())`,
          [
            farmerDbId,
            name || 'Draft Listing',
            category || 'Other',
            safePrice,
            safeQuantity,
            location || 'Addis Ababa',
            description || null,
            status
          ]
        );
      }
      console.log('Listing created successfully with ID:', result.insertId);
    } catch (insertError) {
      console.error('Error creating listing:', insertError);
      throw new Error(`Failed to create listing: ${insertError.message}`);
    }

    const listingId = result.insertId;

    // Add image if provided
    if (image) {
      try {
        // Ensure listing_images table exists
        await pool.query(`CREATE TABLE IF NOT EXISTS listing_images (
          id INT PRIMARY KEY AUTO_INCREMENT,
          listing_id INT NOT NULL,
          url TEXT NOT NULL,
          sort_order INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_images_listing (listing_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        // Store relative path if it's a full URL, otherwise store as-is
        let imagePath = image;
        if (image.startsWith('http://') || image.startsWith('https://')) {
          // Extract relative path from full URL (e.g., "http://localhost:5000/uploads/file.jpg" -> "uploads/file.jpg")
          try {
            const urlObj = new URL(image);
            imagePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
          } catch {
            // If URL parsing fails, try simple string extraction
            const match = image.match(/\/uploads\/[^\/]+$/);
            if (match) {
              imagePath = match[0].slice(1); // Remove leading slash
            }
          }
        }

        await pool.query(
          `INSERT INTO listing_images (listing_id, url, sort_order) VALUES (?, ?, 0)`,
          [listingId, imagePath]
        );
        console.log('Primary image added to listing with sort_order 0:', imagePath);
      } catch (err) {
        console.error('Error adding image to listing:', err);
        // Continue even if image insert fails
      }
    }

    // Get the created listing with all details
    const [listingRows] = await pool.query(
      (useNewSchema
        ? `SELECT
            pl.id,
            pl.title,
            pl.crop,
            pl.price_per_unit as pricePerUnit,
            pl.quantity as quantity,
            pl.unit,
            pl.region,
            pl.woreda,
            pl.description,
            pl.status,
            pl.created_at as createdAt,
            pl.updated_at as updatedAt,
            li.url as image
          FROM produce_listings pl
          LEFT JOIN listing_images li ON li.listing_id = pl.id AND li.sort_order = 0
          WHERE pl.id = ?`
        : `SELECT
            pl.id,
            pl.name as title,
            pl.category as crop,
            pl.price_per_kg as pricePerUnit,
            pl.available_quantity as quantity,
            pl.unit,
            pl.location as region,
            NULL as woreda,
            pl.description,
            pl.status,
            pl.created_at as createdAt,
            pl.updated_at as updatedAt,
            pl.image_url as image
          FROM produce_listings pl
          WHERE pl.id = ?`),
      [listingId]
    );

    if (listingRows.length === 0) {
      return res.status(500).json({ error: "Failed to retrieve created listing" });
    }

    const createdListing = listingRows[0];

    // Transform to match frontend expectations
    const transformedListing = {
      id: createdListing.id,
      name: createdListing.title,
      nameAm: null,
      image: normalizeImageUrl(createdListing.image) || null,
      pricePerKg: createdListing.pricePerUnit,
      availableQuantity: createdListing.quantity,
      location: createdListing.woreda ? `${createdListing.region}, ${createdListing.woreda}` : createdListing.region,
      status: createdListing.status,
      createdAt: createdListing.createdAt,
      category: createdListing.crop,
      unit: createdListing.unit,
      currency: 'ETB'
    };

    res.status(201).json(transformedListing);
  } catch (error) {
    console.error("Error creating farmer listing:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to create listing";
    let statusCode = 500;

    if (error.message.includes('Database error')) {
      errorMessage = "Database connection error. Please try again.";
    } else if (error.message.includes('Failed to create listing')) {
      errorMessage = error.message;
    } else if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = "A listing with this information already exists";
      statusCode = 409;
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      errorMessage = "Invalid user reference";
      statusCode = 400;
    }

    res.status(statusCode).json({
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
        stack: error.stack
      })
    });
  }
};

// Update existing produce listing for farmer
export const updateFarmerListing = async (req, res) => {
  try {
    const farmerId = req.user.uid;
    const { id } = req.params;
    const {
      name,
      nameAm,
      description,
      descriptionAm,
      category,
      pricePerKg,
      availableQuantity,
      location,
      image,
      status
    } = req.body;

    // Validate required fields (relaxed for drafts)
    if (status !== 'draft' && (!name || !category || !pricePerKg || !availableQuantity || !location)) {
      return res.status(400).json({
        error: "Missing required fields: name, category, pricePerKg, availableQuantity, location"
      });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['active', 'inactive', 'sold_out', 'low_stock', 'draft', 'paused', 'sold', 'expired'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
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

    // Check which schema to use
    const useNewSchema = await columnExists('produce_listings', 'farmer_user_id');

    // Verify the listing belongs to this farmer
    const farmerColumn = useNewSchema ? 'farmer_user_id' : 'farmer_id';
    const [listingRows] = await pool.query(
      `SELECT id FROM produce_listings WHERE id = ? AND ${farmerColumn} = ?`,
      [id, farmerDbId]
    );

    if (listingRows.length === 0) {
      return res.status(404).json({ error: "Listing not found or not authorized" });
    }

    // Update the listing based on schema
    if (useNewSchema) {
      const updateFields = [
        'title = ?',
        'crop = ?',
        'quantity = ?',
        'unit = ?',
        'price_per_unit = ?',
        'region = ?',
        'description = ?',
        'updated_at = NOW()'
      ];

      const safeQuantity = status === 'draft' ? Math.max(1, Number(availableQuantity) || 1) : (Number(availableQuantity) || 0);
      const safePrice = status === 'draft' ? Math.max(0.01, Number(pricePerKg) || 0.01) : (Number(pricePerKg) || 0);
      const updateValues = [
        name || 'Draft Listing',
        category || 'Other',
        safeQuantity,
        'kg',
        safePrice,
        location || 'Addis Ababa',
        description || null
      ];

      // Add status to update if provided
      if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      updateValues.push(id);

      await pool.query(
        `UPDATE produce_listings SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    } else {
      const updateFields = [
        'name = ?',
        'name_am = ?',
        'category = ?',
        'available_quantity = ?',
        'unit = ?',
        'price_per_kg = ?',
        'location = ?',
        'description = ?',
        'updated_at = NOW()'
      ];

      const safeQuantity = status === 'draft' ? Math.max(1, Number(availableQuantity) || 1) : (Number(availableQuantity) || 0);
      const safePrice = status === 'draft' ? Math.max(0.01, Number(pricePerKg) || 0.01) : (Number(pricePerKg) || 0);
      const updateValues = [
        name || 'Draft Listing',
        nameAm || null,
        category || 'Other',
        safeQuantity,
        'kg',
        safePrice,
        location || 'Addis Ababa',
        description || null
      ];

      // Add status to update if provided
      if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      updateValues.push(id);

      await pool.query(
        `UPDATE produce_listings SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Get the updated listing
    let selectQuery;
    if (useNewSchema) {
      selectQuery = `SELECT
        pl.id,
        pl.title as name,
        pl.crop as category,
        pl.description,
        pl.price_per_unit as pricePerKg,
        pl.quantity as availableQuantity,
        pl.region as location,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt
      FROM produce_listings pl
      WHERE pl.id = ?`;
    } else {
      selectQuery = `SELECT
        pl.id,
        pl.name,
        pl.name_am,
        pl.description,
        pl.category,
        pl.price_per_kg as pricePerKg,
        pl.available_quantity as availableQuantity,
        pl.location,
        pl.image_url as image,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt
      FROM produce_listings pl
      WHERE pl.id = ?`;
    }

    const [updatedListingRows] = await pool.query(selectQuery, [id]);

    if (updatedListingRows.length === 0) {
      return res.status(500).json({ error: "Failed to retrieve updated listing" });
    }

    const updatedListing = updatedListingRows[0];

    res.json(updatedListing);
  } catch (error) {
    console.error("Error updating farmer listing:", error);
    res.status(500).json({ error: "Failed to update listing" });
  }
};

// Update listing status
export const updateListingStatus = async (req, res) => {
  try {
    const farmerId = req.user.uid;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'sold_out', 'low_stock', 'draft'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
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

    // Verify the listing belongs to this farmer
    const [listingRows] = await pool.query(
      'SELECT id FROM produce_listings WHERE id = ? AND farmer_user_id = ?',
      [id, farmerDbId]
    );

    if (listingRows.length === 0) {
      return res.status(404).json({ error: "Listing not found or not authorized" });
    }

    // Update the listing status
    await pool.query(
      'UPDATE produce_listings SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({ message: "Listing status updated successfully" });
  } catch (error) {
    console.error("Error updating listing status:", error);
    res.status(500).json({ error: "Failed to update listing status" });
  }
};

// Upload image for farmer
export const uploadImage = async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      user: req.user ? req.user.uid : 'No user'
    });

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Store relative path in database (will be normalized when read)
    const relativePath = `uploads/${req.file.filename}`;

    // Generate public URL for response (normalized)
    const publicUrl = normalizeImageUrl(relativePath);

    console.log('Image uploaded successfully:', {
      filename: req.file.filename,
      relativePath,
      publicUrl
    });

    res.json({
      message: "Image uploaded successfully",
      imageUrl: publicUrl, // Return public URL for immediate use
      relativePath: relativePath, // Also return relative path for database storage
      filename: req.file.filename
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

// Bulk update listing statuses
export const bulkUpdateListingStatus = async (req, res) => {
  try {
    const farmerId = req.user.uid;
    const { listingIds, status } = req.body;

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ error: "Invalid listing IDs provided" });
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'sold_out', 'low_stock', 'draft'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
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

    // Verify all listings belong to this farmer
    const placeholders = listingIds.map(() => '?').join(',');
    const [listings] = await pool.query(
      `SELECT id FROM produce_listings WHERE id IN (${placeholders}) AND farmer_user_id = ?`,
      [...listingIds, farmerDbId]
    );

    if (listings.length !== listingIds.length) {
      return res.status(403).json({ error: "Some listings not found or not authorized" });
    }

    // Update all listings
    await pool.query(
      `UPDATE produce_listings SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [status, ...listingIds]
    );

    res.json({
      message: `Successfully updated ${listingIds.length} listings to ${status}`,
      updatedCount: listingIds.length
    });
  } catch (error) {
    console.error("Error bulk updating listing status:", error);
    res.status(500).json({ error: "Failed to bulk update listing status" });
  }
};

// Bulk delete listings
export const bulkDeleteListings = async (req, res) => {
  try {
    const farmerId = req.user.uid;
    const { listingIds } = req.body;

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ error: "Invalid listing IDs provided" });
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

    // Verify all listings belong to this farmer
    const placeholders = listingIds.map(() => '?').join(',');
    const [listings] = await pool.query(
      `SELECT id FROM produce_listings WHERE id IN (${placeholders}) AND farmer_user_id = ?`,
      [...listingIds, farmerDbId]
    );

    if (listings.length !== listingIds.length) {
      return res.status(403).json({ error: "Some listings not found or not authorized" });
    }

    // Check if any listings have active orders
    const [orders] = await pool.query(
      `SELECT COUNT(*) as count FROM order_items WHERE listing_id IN (${placeholders})`,
      listingIds
    );

    if (orders[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete listings with active orders. Consider setting status to 'inactive' instead."
      });
    }

    // Delete listing images first
    await pool.query(
      `DELETE FROM listing_images WHERE listing_id IN (${placeholders})`,
      listingIds
    );

    // Delete the listings
    await pool.query(
      `DELETE FROM produce_listings WHERE id IN (${placeholders})`,
      listingIds
    );

    res.json({
      message: `Successfully deleted ${listingIds.length} listings`,
      deletedCount: listingIds.length
    });
  } catch (error) {
    console.error("Error bulk deleting listings:", error);
    res.status(500).json({ error: "Failed to bulk delete listings" });
  }
};

// Delete a single listing for the authenticated farmer
export const deleteFarmerListing = async (req, res) => {
  try {
    const farmerId = req.user.uid;
    const { id } = req.params;

    // Get farmer DB id
    const [farmerRows] = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = ?',
      [farmerId]
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    const farmerDbId = farmerRows[0].id;

    // Support both schemas and verify ownership
    const hasNewSchema = await columnExists('produce_listings', 'farmer_user_id');
    const farmerColumn = hasNewSchema ? 'farmer_user_id' : 'farmer_id';

    const [listingRows] = await pool.query(
      `SELECT id FROM produce_listings WHERE id = ? AND ${farmerColumn} = ?`,
      [id, farmerDbId]
    );

    if (listingRows.length === 0) {
      return res.status(404).json({ error: "Listing not found or not authorized" });
    }

    // Block delete if there are order items
    try {
      const [orders] = await pool.query(
        'SELECT COUNT(*) as count FROM order_items WHERE listing_id = ?',
        [id]
      );
      if (orders[0]?.count > 0) {
        return res.status(400).json({
          error: "Cannot delete listing with active orders. Consider setting status to 'inactive' instead."
        });
      }
    } catch (_) {
      // If order_items table missing, skip this check in legacy envs
    }

    // Delete images if listing_images table exists
    try {
      await pool.query('DELETE FROM listing_images WHERE listing_id = ?', [id]);
    } catch (_) {
      // ignore for legacy schema
    }

    // Delete the listing
    await pool.query('DELETE FROM produce_listings WHERE id = ?', [id]);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting farmer listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};

// Add image to a specific listing
export const addListingImage = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id: listingIdParam } = req.params;
    const file = req.file;
    const { url } = req.body;

    console.log('addListingImage called with:', {
      uid,
      listingId,
      hasFile: !!file,
      hasUrl: !!url,
      url: url
    });

    // Basic validation
    const listingId = Number.parseInt(listingIdParam, 10);
    if (!Number.isFinite(listingId) || listingId <= 0) {
      return res.status(400).json({ error: "Invalid listing id" });
    }
    if (!file && (!url || typeof url !== 'string' || url.trim().length === 0)) {
      return res.status(400).json({ error: "No image file or URL provided" });
    }

    // Get user ID
    let userId;

    if (uid.startsWith('dev-uid-')) {
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

    // Verify user owns the listing (check both old and new schema)
    const [listings] = await pool.query(
      "SELECT * FROM produce_listings WHERE id = ? AND (farmer_user_id = ? OR farmer_id = ?)",
      [listingId, userId, userId]
    );

    if (listings.length === 0) {
      return res.status(404).json({ error: "Listing not found or not authorized" });
    }

    // Determine image URL - either from file upload or direct URL
    let imageUrl;
    if (file && file.filename) {
      // store relative path; readers normalize to absolute
      imageUrl = `uploads/${file.filename}`;
    } else if (url) {
      imageUrl = url.trim();
    } else {
      return res.status(400).json({ error: "No image file or URL provided" });
    }

    // Ensure listing_images table exists (idempotent)
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS listing_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        listing_id INT NOT NULL,
        url TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_images_listing (listing_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    } catch (tableError) {
      console.error('Failed to ensure listing_images table exists:', tableError.message);
      return res.status(500).json({
        error: "Failed to prepare image storage",
        details: tableError.message
      });
    }

    // Get the next sort order for this listing
    let nextSortOrder = 0;
    try {
      const [existingImages] = await pool.query(
        "SELECT MAX(sort_order) as max_sort FROM listing_images WHERE listing_id = ?",
        [listingId]
      );

      nextSortOrder = (existingImages[0]?.max_sort ?? -1) + 1;
    } catch (sortError) {
      console.warn('Could not get max sort order, using 0:', sortError.message);
      nextSortOrder = 0;
    }

    // Insert image into listing_images table
    console.log('Inserting image into listing_images table:', {
      listingId,
      imageUrl,
      userId,
      sortOrder: nextSortOrder
    });

    try {
      await pool.query(
        "INSERT INTO listing_images (listing_id, url, sort_order) VALUES (?, ?, ?)",
        [listingId, imageUrl, nextSortOrder]
      );

      console.log('Image successfully inserted into database with sort_order:', nextSortOrder);
    } catch (insertError) {
      console.error('Failed to insert image into database:', insertError);
      if (insertError?.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({ error: 'listing_images table missing. Run server setup or migrations.' });
      }
      return res.status(500).json({ error: 'Failed to save image', details: insertError.message });
    }

    res.status(201).json({
      message: "Image added to listing successfully",
      image: {
        listing_id: listingId,
        url: normalizeImageUrl(imageUrl)
      }
    });

  } catch (error) {
    console.error('Error adding image to listing:', error);
    res.status(500).json({ error: "Failed to add image to listing" });
  }
};
