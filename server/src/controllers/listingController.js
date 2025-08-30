import { pool } from '../config/database.js';

// Get all active listings for buyer dashboard
export const getAllActiveListings = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const query = `
      SELECT
        pl.id,
        pl.name,
        pl.name_am as nameAm,
        pl.description,
        pl.description_am as descriptionAm,
        pl.price_per_kg as pricePerKg,
        pl.available_quantity as availableQuantity,
        pl.category,
        pl.image_url as image,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt,
        u.full_name as farmerName,
        u.avatar as farmerAvatar,
        pl.location
      FROM produce_listings pl
      JOIN users u ON pl.farmer_id = u.id
      WHERE pl.status = 'active'
      AND pl.available_quantity > 0
      ORDER BY pl.created_at DESC
    `;

    const [rows] = await connection.execute(query);
    connection.release();

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
    const connection = await pool.getConnection();

    const query = `
      SELECT
        pl.id,
        pl.name,
        pl.name_am as nameAm,
        pl.description,
        pl.description_am as descriptionAm,
        pl.price_per_kg as pricePerKg,
        pl.available_quantity as availableQuantity,
        pl.category,
        pl.image_url as image,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt,
        u.full_name as farmerName,
        u.avatar as farmerAvatar,
        pl.location,
        u.phone as farmerPhone,
        u.email as farmerEmail
      FROM produce_listings pl
      JOIN users u ON pl.farmer_id = u.id
      WHERE pl.id = ?
    `;

    const [rows] = await connection.execute(query, [id]);
    connection.release();

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

    const connection = await pool.getConnection();

    let whereClause = 'WHERE pl.status = "active" AND pl.available_quantity > 0';
    const params = [];

    // Search query filter
    if (searchQuery) {
      whereClause += ' AND (pl.name LIKE ? OR pl.name_am LIKE ? OR pl.location LIKE ?)';
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Category filter
    if (category && category !== 'all') {
      whereClause += ' AND pl.category = ?';
      params.push(category);
    }

    // Region filter
    if (region && region !== 'all') {
      whereClause += ' AND pl.location = ?';
      params.push(region);
    }

    // Price range filter
    if (minPrice) {
      whereClause += ' AND pl.price_per_kg >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      whereClause += ' AND pl.price_per_kg <= ?';
      params.push(Number(maxPrice));
    }

    // Sorting
    let orderClause = 'ORDER BY ';
    switch (sortBy) {
      case 'price-low':
        orderClause += 'pl.price_per_kg ASC';
        break;
      case 'price-high':
        orderClause += 'pl.price_per_kg DESC';
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
        pl.name,
        pl.name_am as nameAm,
        pl.description,
        pl.description_am as descriptionAm,
        pl.price_per_kg as pricePerKg,
        pl.available_quantity as availableQuantity,
        pl.category,
        pl.image_url as image,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt,
        u.full_name as farmerName,
        u.avatar as farmerAvatar,
        pl.location
      FROM produce_listings pl
      JOIN users u ON pl.farmer_id = u.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    params.push(Number(limit), Number(offset));

    const [rows] = await connection.execute(sql, params);
    connection.release();

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
        pl.name,
        pl.name_am as nameAm,
        pl.description,
        pl.description_am as descriptionAm,
        pl.price_per_kg as pricePerKg,
        pl.available_quantity as availableQuantity,
        pl.category,
        pl.image_url as image,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt,
        u.full_name as farmerName,
        u.avatar as farmerAvatar,
        pl.location
      FROM produce_listings pl
      JOIN users u ON pl.farmer_id = u.id
      WHERE pl.category = ?
      AND pl.status = 'active'
      AND pl.available_quantity > 0
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
        pl.name,
        pl.name_am as nameAm,
        pl.description,
        pl.description_am as descriptionAm,
        pl.price_per_kg as pricePerKg,
        pl.available_quantity as availableQuantity,
        pl.category,
        pl.image_url as image,
        pl.status,
        pl.created_at as createdAt,
        pl.updated_at as updatedAt,
        u.full_name as farmerName,
        u.avatar as farmerAvatar,
        pl.location
      FROM produce_listings pl
      JOIN users u ON pl.farmer_id = u.id
      WHERE pl.location = ?
      AND pl.status = 'active'
      AND pl.available_quantity > 0
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
