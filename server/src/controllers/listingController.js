import { pool } from '../config/database.js';
import { normalizeImageUrl } from '../utils/url.js';

// Get all active listings for buyer dashboard
export const getAllActiveListings = async (req, res) => {
  try {
    const startTime = Date.now();

    // First get all listings
    const listingsQuery = `
      SELECT
        pl.id,
        pl.title as name,
        pl.crop as nameAm,
        pl.description,
        pl.price_per_unit as pricePerKg,
        pl.quantity as availableQuantity,
        pl.crop as category,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt,
        u.full_name as farmerName,
        NULL as farmerAvatar,
        pl.region as location,
        pl.woreda,
        pl.unit,
        pl.currency,
        u.id as farmer_user_id,
        u.phone as farmer_phone
      FROM produce_listings pl
      JOIN users u ON pl.farmer_user_id = u.id
      WHERE pl.status = 'active'
      AND pl.quantity > 0
      ORDER BY pl.created_at DESC
      LIMIT 100
    `;

    const [listings] = await pool.query(listingsQuery);

    // Get all images for these listings
    const listingIds = listings.map(l => l.id);
    let images = [];

    if (listingIds.length > 0) {
      const imagesQuery = `
        SELECT listing_id, url, sort_order
        FROM listing_images
        WHERE listing_id IN (${listingIds.map(() => '?').join(',')})
        ORDER BY listing_id, sort_order
      `;

      const [imageRows] = await pool.query(imagesQuery, listingIds);
      images = imageRows;
    }

    // Group images by listing_id
    const imagesByListing = {};
    images.forEach(img => {
      if (!imagesByListing[img.listing_id]) {
        imagesByListing[img.listing_id] = [];
      }
      imagesByListing[img.listing_id].push(normalizeImageUrl(img.url));
    });

    // Add images to listings
    const listingsWithImages = listings.map(listing => ({
      ...listing,
      image: imagesByListing[listing.id]?.[0] || null, // Primary image for backward compatibility
      images: imagesByListing[listing.id] || [] // All images
    }));

    const queryTime = Date.now() - startTime;
    console.log(`Active listings query took ${queryTime}ms, returned ${listingsWithImages.length} results`);

    res.json({
      success: true,
      count: listingsWithImages.length,
      listings: listingsWithImages,
      queryTime: queryTime
    });
  } catch (error) {
    console.error('Error fetching active listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings',
      details: error.message
    });
  }
};

// Get listing by ID
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    // First get the listing
    const listingQuery = `
      SELECT
        pl.id,
        pl.title as name,
        pl.crop as nameAm,
        pl.description,
        pl.price_per_unit as pricePerKg,
        pl.quantity as availableQuantity,
        pl.crop as category,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt,
        u.full_name as farmerName,
        NULL as farmerAvatar,
        pl.region as location,
        u.phone as farmerPhone,
        u.email as farmerEmail,
        pl.unit,
        pl.currency
      FROM produce_listings pl
      JOIN users u ON pl.farmer_user_id = u.id
      WHERE pl.id = ?
    `;

    const [listingRows] = await pool.query(listingQuery, [id]);

    if (listingRows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingRows[0];

    // Get all images for this listing
    const imagesQuery = `
      SELECT url, sort_order
      FROM listing_images
      WHERE listing_id = ?
      ORDER BY sort_order
    `;

    const [imageRows] = await pool.query(imagesQuery, [id]);
    const images = imageRows.map(img => normalizeImageUrl(img.url));

    // Add images to listing
    const listingWithImages = {
      ...listing,
      image: images[0] || null, // Primary image for backward compatibility
      images: images // All images
    };

    res.json(listingWithImages);
  } catch (error) {
    console.error('Error fetching listing by ID:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

// Search listings with filters
export const searchListings = async (req, res) => {
  try {
    const {
      query: searchQuery,
      category,
      region,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      limit = 20,
      offset = 0
    } = req.query;

    let whereClause = 'WHERE pl.status = "active" AND pl.quantity > 0';
    const params = [];

    // Search query filter
    if (searchQuery) {
      whereClause += ' AND (pl.title LIKE ? OR pl.crop LIKE ? OR pl.region LIKE ?)';
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Category filter
    if (category && category !== 'all') {
      whereClause += ' AND pl.crop = ?';
      params.push(category);
    }

    // Region filter
    if (region && region !== 'all') {
      whereClause += ' AND pl.region = ?';
      params.push(region);
    }

    // Price range filter
    if (minPrice) {
      whereClause += ' AND pl.price_per_unit >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      whereClause += ' AND pl.price_per_unit <= ?';
      params.push(Number(maxPrice));
    }

    // Sorting
    let orderClause = 'ORDER BY ';
    switch (sortBy) {
      case 'price-low':
        orderClause += 'pl.price_per_unit ASC';
        break;
      case 'price-high':
        orderClause += 'pl.price_per_unit DESC';
        break;
      case 'oldest':
        orderClause += 'pl.created_at ASC';
        break;
      case 'newest':
      default:
        orderClause += 'pl.created_at DESC';
        break;
    }

    const sql = `
      SELECT
        pl.id,
        pl.title as name,
        pl.crop as nameAm,
        pl.description,
        pl.price_per_unit as pricePerKg,
        pl.quantity as availableQuantity,
        pl.crop as category,
        li.url as image,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt,
        u.full_name as farmerName,
        u.avatar_url as farmerAvatar,
        pl.region as location,
        pl.unit,
        pl.currency
      FROM produce_listings pl
      JOIN users u ON pl.farmer_user_id = u.id
      LEFT JOIN listing_images li ON pl.id = li.listing_id AND li.sort_order = 0
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);
    // Normalize image and avatar URLs for search listings
    const normalized = rows.map(r => ({
      ...r,
      image: normalizeImageUrl(r.image),
      farmerAvatar: normalizeImageUrl(r.farmerAvatar)
    }));
    res.json(normalized);
  } catch (error) {
    console.error('Error searching listings:', error);
    res.status(500).json({ error: 'Failed to search listings' });
  }
};

// Get listings by category
export const getListingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const query = `
      SELECT
        pl.id,
        pl.title as name,
        pl.crop as nameAm,
        pl.description,
        pl.price_per_unit as pricePerKg,
        pl.quantity as availableQuantity,
        pl.crop as category,
        li.url as image,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt,
        u.full_name as farmerName,
        u.avatar_url as farmerAvatar,
        pl.region as location,
        pl.unit,
        pl.currency
      FROM produce_listings pl
      JOIN users u ON pl.farmer_user_id = u.id
      LEFT JOIN listing_images li ON pl.id = li.listing_id AND li.sort_order = 0
      WHERE pl.crop = ?
      AND pl.status = 'active'
      AND pl.quantity > 0
      ORDER BY pl.created_at DESC
    `;

    const [rows] = await pool.query(query, [category]);
    res.json(rows.map(r => ({
      ...r,
      image: normalizeImageUrl(r.image),
      farmerAvatar: normalizeImageUrl(r.farmerAvatar)
    })));
  } catch (error) {
    console.error('Error fetching listings by category:', error);
    res.status(500).json({ error: 'Failed to fetch listings by category' });
  }
};

// Get listings by region
export const getListingsByRegion = async (req, res) => {
  try {
    const { region } = req.params;

    const query = `
      SELECT
        pl.id,
        pl.title as name,
        pl.crop as nameAm,
        pl.description,
        pl.price_per_unit as pricePerKg,
        pl.quantity as availableQuantity,
        pl.crop as category,
        li.url as image,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt,
        u.full_name as farmerName,
        u.avatar_url as farmerAvatar,
        pl.region as location,
        pl.unit,
        pl.currency
      FROM produce_listings pl
      JOIN users u ON pl.farmer_user_id = u.id
      LEFT JOIN listing_images li ON pl.id = li.listing_id AND li.sort_order = 0
      WHERE pl.region = ?
      AND pl.status = 'active'
      AND pl.quantity > 0
      ORDER BY pl.created_at DESC
    `;

    const [rows] = await pool.query(query, [region]);
    res.json(rows.map(r => ({
      ...r,
      image: normalizeImageUrl(r.image),
      farmerAvatar: normalizeImageUrl(r.farmerAvatar)
    })));
  } catch (error) {
    console.error('Error fetching listings by region:', error);
    res.status(500).json({ error: 'Failed to fetch listings by region' });
  }
};

// Create new listing
export const createListing = async (req, res) => {
  try {
    const uid = req.user.uid;
    const {
      title, crop, variety, quantity, unit, pricePerUnit, currency,
      availableFrom, availableUntil, region, woreda, description
    } = req.body;

    // Get user ID - handle both Firebase and dev users
    let userId, userRole;

    if (uid.startsWith('dev-uid-')) {
      // Dev user - use the ID from the token
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

    if (userRole !== 'farmer') {
      return res.status(403).json({ error: "Only farmers can create listings" });
    }

    // Insert listing
    const [result] = await pool.query(
      `INSERT INTO produce_listings (
        farmer_user_id, title, crop, variety, quantity, unit,
        price_per_unit, currency, available_from, available_until,
        region, woreda, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        userId, title, crop, variety, quantity, unit, pricePerUnit,
        currency, availableFrom, availableUntil, region, woreda, description
      ]
    );

    const listingId = result.insertId;

    // Best-effort: notify all buyers about the new listing
    try {
      const notificationTitle = title || crop || 'New Product';
      const notificationMessage = `New product listed: ${notificationTitle}`;
      await pool.query(
        `INSERT INTO notifications (user_id, type, payload, is_read)
         SELECT id, 'new_listing', JSON_OBJECT(
           'title', ?,
           'message', ?,
           'listingId', ?,
           'action', 'view_listing',
           'region', ?,
           'woreda', ?
         ), 0
         FROM users
         WHERE role = 'buyer'`,
        [notificationTitle, notificationMessage, listingId, region || null, woreda || null]
      );
    } catch (notifyErr) {
      // Non-fatal: log and continue
      console.warn('Failed to create buyer notifications for new listing:', notifyErr.message);
    }

    res.status(201).json({
      id: listingId,
      message: "Listing created successfully",
      listing: {
        id: listingId,
        title,
        crop,
        variety,
        quantity,
        unit,
        pricePerUnit,
        currency,
        availableFrom,
        availableUntil,
        region,
        woreda,
        description,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: "Failed to create listing" });
  }
};

// Get listings with filtering and pagination
export const getListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      crop,
      region,
      woreda,
      minPrice,
      maxPrice,
      verifiedOnly = false,
      status = 'active',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const validSortFields = ['created_at', 'price_per_unit', 'quantity', 'title'];
    const validSortOrders = ['ASC', 'DESC'];

    if (!validSortFields.includes(sortBy)) sortBy = 'created_at';
    if (!validSortOrders.includes(sortOrder.toUpperCase())) sortOrder = 'DESC';

    let whereClause = "WHERE l.status = ?";
    let params = [status];

    if (crop) {
      whereClause += " AND l.crop LIKE ?";
      params.push(`%${crop}%`);
    }

    if (region) {
      whereClause += " AND l.region = ?";
      params.push(region);
    }

    if (woreda) {
      whereClause += " AND l.woreda = ?";
      params.push(woreda);
    }

    if (minPrice) {
      whereClause += " AND l.price_per_unit >= ?";
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      whereClause += " AND l.price_per_unit <= ?";
      params.push(parseFloat(maxPrice));
    }

    if (verifiedOnly) {
      whereClause += " AND u.id IN (SELECT user_id FROM farmer_profiles WHERE certifications IS NOT NULL)";
    }

    // Get listings with farmer info
    const [listings] = await pool.query(
      `SELECT
        l.*,
        u.full_name as farmer_name,
        u.phone as farmer_phone,
        u.region as farmer_region,
        u.woreda as farmer_woreda,
        fp.farm_name,
        fp.experience_years,
        fp.certifications
      FROM produce_listings l
      JOIN users u ON l.farmer_user_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      ${whereClause}
      ORDER BY l.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM produce_listings l
       JOIN users u ON l.farmer_user_id = u.id
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      listings,
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
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

// Update a listing
export const updateListing = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;
    const updateData = req.body;

    // Verify user owns the listing
    const [listings] = await pool.query(
      `SELECT l.*, u.firebase_uid, u.id as user_id
       FROM produce_listings l
       JOIN users u ON l.farmer_user_id = u.id
       WHERE l.id = ?`,
      [id]
    );

    if (listings.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check authorization - handle both Firebase and dev users
    let isAuthorized = false;

    if (uid.startsWith('dev-uid-')) {
      // Dev user - check if the user ID matches
      isAuthorized = (req.user.id === listings[0].user_id);
    } else {
      // Real Firebase user - check firebase_uid
      isAuthorized = (listings[0].firebase_uid === uid);
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: "Not authorized to update this listing" });
    }

    // Build update query dynamically
    const allowedFields = [
      'title', 'crop', 'variety', 'quantity', 'unit', 'price_per_unit',
      'currency', 'available_from', 'available_until', 'region', 'woreda',
      'description', 'status'
    ];

    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    values.push(id);

    await pool.query(
      `UPDATE produce_listings SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: "Listing updated successfully" });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: "Failed to update listing" });
  }
};

// Delete a listing
export const deleteListing = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    // Verify user owns the listing
    const [listings] = await pool.query(
      `SELECT l.*, u.firebase_uid
       FROM produce_listings l
       JOIN users u ON l.farmer_user_id = u.id
       WHERE l.id = ?`,
      [id]
    );

    if (listings.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listings[0].firebase_uid !== uid) {
      return res.status(403).json({ error: "Not authorized to delete this listing" });
    }

    // Check if listing has active orders
    const [orders] = await pool.query(
      "SELECT COUNT(*) as count FROM order_items WHERE listing_id = ?",
      [id]
    );

    if (orders[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete listing with active orders. Consider setting status to 'expired' instead."
      });
    }

    // Delete listing images first
    await pool.query("DELETE FROM listing_images WHERE listing_id = ?", [id]);

    // Delete the listing
    await pool.query("DELETE FROM produce_listings WHERE id = ?", [id]);

    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: "Failed to delete listing" });
  }
};

// Get farmer's listings
export const getFarmerListings = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { status } = req.query;

    // Get user ID
    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = ?",
      [uid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRows[0].id;
    let whereClause = "WHERE farmer_user_id = ?";
    let params = [userId];

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    const [listings] = await pool.query(
      `SELECT * FROM produce_listings ${whereClause} ORDER BY created_at DESC`,
      params
    );

    res.json({ listings });
  } catch (error) {
    console.error('Error fetching farmer listings:', error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};
