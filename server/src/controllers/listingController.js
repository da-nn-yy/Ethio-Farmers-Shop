import { pool } from '../config/database.js';

// Get all active listings for buyer dashboard
export const getAllActiveListings = async (req, res) => {
  try {
    const query = `
      SELECT
        pl.id,
        pl.title as name,
        pl.crop as nameAm,
        pl.description,
        pl.description_am,
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
      WHERE pl.status = 'active'
      AND pl.quantity > 0
      ORDER BY pl.created_at DESC
    `;

    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching active listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

// Get listing by ID
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        pl.id,
        pl.title as name,
        pl.crop as nameAm,
        pl.description,
        pl.description_am,
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
        u.phone as farmerPhone,
        u.email as farmerEmail,
        pl.unit,
        pl.currency
      FROM produce_listings pl
      JOIN users u ON pl.farmer_user_id = u.id
      LEFT JOIN listing_images li ON pl.id = li.listing_id AND li.sort_order = 0
      WHERE pl.id = ?
    `;

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(rows[0]);
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
        pl.description_am,
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
    res.json(rows);
  } catch (error) {
    console.error('Error searching listings:', error);
    res.status(500).json({ error: 'Failed to search listings' });
  }
};

// Get listings by category
export const getListingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const connection = await pool.getConnection();

    const query = `
      SELECT
        pl.id,
        pl.title as name,
        pl.crop as nameAm,
        pl.description,
        pl.description_am,
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

    const [rows] = await connection.execute(query, [category]);
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error fetching listings by category:', error);
    res.status(500).json({ error: 'Failed to fetch listings by category' });
  }
};

// Get listings by region
export const getListingsByRegion = async (req, res) => {
  try {
    const { region } = req.params;
    const connection = await pool.getConnection();

    const query = `
      SELECT
        pl.id,
        pl.title as name,
        pl.crop as nameAm,
        pl.description,
        pl.description_am,
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

    const [rows] = await connection.execute(query, [region]);
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error fetching listings by region:', error);
    res.status(500).json({ error: 'Failed to fetch listings by region' });
  }
};
