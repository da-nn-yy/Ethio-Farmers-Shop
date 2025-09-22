import { pool } from '../config/database.js';

// Advanced search for listings
export const searchListings = async (req, res) => {
  try {
    const {
      q, crop, region, woreda, minPrice, maxPrice, minQuantity, maxQuantity, unit,
      verifiedOnly = false, availableFrom, availableUntil, sortBy = 'relevance',
      sortOrder = 'DESC', page = 1, limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = "WHERE l.status = 'active'";
    let params = [];

    // Text search
    if (q) {
      whereClause += " AND (l.title LIKE ? OR l.crop LIKE ? OR l.description LIKE ? OR l.variety LIKE ?)";
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Crop filter
    if (crop) {
      whereClause += " AND l.crop LIKE ?";
      params.push(`%${crop}%`);
    }

    // Location filters
    if (region) {
      whereClause += " AND l.region = ?";
      params.push(region);
    }

    if (woreda) {
      whereClause += " AND l.woreda = ?";
      params.push(woreda);
    }

    // Price filters
    if (minPrice) {
      whereClause += " AND l.price_per_unit >= ?";
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      whereClause += " AND l.price_per_unit <= ?";
      params.push(parseFloat(maxPrice));
    }

    // Quantity filters
    if (minQuantity) {
      whereClause += " AND l.quantity >= ?";
      params.push(parseFloat(minQuantity));
    }

    if (maxQuantity) {
      whereClause += " AND l.quantity <= ?";
      params.push(parseFloat(maxQuantity));
    }

    // Unit filter
    if (unit) {
      whereClause += " AND l.unit = ?";
      params.push(unit);
    }

    // Availability filters
    if (availableFrom) {
      whereClause += " AND l.available_from >= ?";
      params.push(availableFrom);
    }

    if (availableUntil) {
      whereClause += " AND l.available_until <= ?";
      params.push(availableUntil);
    }

    // Build ORDER BY clause
    let orderClause = "ORDER BY ";
    if (sortBy === 'relevance' && q) {
      // Relevance scoring based on text match
      orderClause += `CASE
        WHEN l.title LIKE ? THEN 3
        WHEN l.crop LIKE ? THEN 2
        WHEN l.description LIKE ? THEN 1
        ELSE 0
      END DESC, l.created_at DESC`;
      const exactTerm = q;
      params.push(exactTerm, exactTerm, exactTerm);
    } else if (sortBy === 'price') {
      orderClause += `l.price_per_unit ${sortOrder}`;
    } else if (sortBy === 'quantity') {
      orderClause += `l.quantity ${sortOrder}`;
    } else if (sortBy === 'date') {
      orderClause += `l.created_at ${sortOrder}`;
    } else {
      orderClause += `l.created_at DESC`;
    }

    // Get search results with all available data
    const [listings] = await pool.query(
      `SELECT
        l.*,
        u.full_name as farmer_name,
        u.phone as farmer_phone,
        u.region as farmer_region,
        u.woreda as farmer_woreda,
        fp.farm_name,
        fp.experience_years,
        fp.certifications,
        fp.crops,
        COUNT(f.id) as favorite_count,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as review_count
      FROM produce_listings l
      JOIN users u ON l.farmer_user_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      LEFT JOIN favorites f ON l.id = f.listing_id
      LEFT JOIN reviews r ON l.id = r.listing_id
      ${whereClause}
      GROUP BY l.id, u.full_name, u.phone, u.region, u.woreda, fp.farm_name, fp.experience_years, fp.certifications, fp.crops
      ${orderClause}
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.query(
      `SELECT COUNT(DISTINCT l.id) as total
       FROM produce_listings l
       JOIN users u ON l.farmer_user_id = u.id
       ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Generate search suggestions
    const suggestions = [];
    if (q && q.length > 2) {
      const [suggestionResults] = await pool.query(
        `SELECT DISTINCT crop, variety
         FROM produce_listings
         WHERE (crop LIKE ? OR variety LIKE ?) AND status = 'active'
         LIMIT 5`,
        [`%${q}%`, `%${q}%`]
      );
      suggestions.push(...suggestionResults.map(r => r.crop || r.variety));
    }

    res.json({
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      suggestions: [...new Set(suggestions)].slice(0, 5)
    });

  } catch (error) {
    console.error('Error searching listings:', error);
    res.status(500).json({ error: "Failed to search listings" });
  }
};

// Search for farmers
export const searchFarmers = async (req, res) => {
  try {
    const {
      q, region, woreda, crop, experienceMin, experienceMax, hasCertifications = false,
      sortBy = 'relevance', sortOrder = 'DESC', page = 1, limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = "WHERE u.role = 'farmer'";
    let params = [];

    // Text search
    if (q) {
      whereClause += " AND (u.full_name LIKE ? OR fp.farm_name LIKE ?)";
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm);
    }

    // Location filters
    if (region) {
      whereClause += " AND u.region = ?";
      params.push(region);
    }

    if (woreda) {
      whereClause += " AND u.woreda = ?";
      params.push(woreda);
    }

    // Crop filter
    if (crop) {
      whereClause += " AND fp.crops LIKE ?";
      params.push(`%${crop}%`);
    }

    // Experience filters
    if (experienceMin) {
      whereClause += " AND fp.experience_years >= ?";
      params.push(parseInt(experienceMin));
    }

    if (experienceMax) {
      whereClause += " AND fp.experience_years <= ?";
      params.push(parseInt(experienceMax));
    }

    // Certifications filter
    if (hasCertifications === 'true') {
      whereClause += " AND fp.certifications IS NOT NULL";
    }

    // Build ORDER BY clause
    let orderClause = "ORDER BY ";
    if (sortBy === 'relevance' && q) {
      orderClause += `CASE
        WHEN u.full_name LIKE ? THEN 3
        WHEN fp.farm_name LIKE ? THEN 2
        ELSE 0
      END DESC, fp.experience_years DESC`;
      const exactTerm = q;
      params.push(exactTerm, exactTerm);
    } else if (sortBy === 'experience') {
      orderClause += `fp.experience_years ${sortOrder}`;
    } else {
      orderClause += `u.created_at DESC`;
    }

    // Get search results
    const [farmers] = await pool.query(
      `SELECT
        u.id,
        u.full_name,
        u.phone,
        u.region,
        u.woreda,
        u.created_at,
        fp.farm_name,
        fp.experience_years,
        fp.certifications,
        fp.crops,
        COUNT(DISTINCT l.id) as total_listings,
        COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_listings_count,
        AVG(l.price_per_unit) as avg_price,
        COUNT(DISTINCT f.id) as total_favorites,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as review_count
      FROM users u
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      LEFT JOIN produce_listings l ON u.id = l.farmer_user_id
      LEFT JOIN favorites f ON l.id = f.listing_id
      LEFT JOIN reviews r ON l.id = r.listing_id
      ${whereClause}
      GROUP BY u.id, u.full_name, u.phone, u.region, u.woreda, u.created_at, fp.farm_name, fp.experience_years, fp.certifications, fp.crops
      ${orderClause}
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(DISTINCT u.id) as total
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      farmers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error searching farmers:', error);
    res.status(500).json({ error: "Failed to search farmers" });
  }
};

// Get search suggestions
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = `%${q}%`;
    let suggestions = [];

    if (type === 'all' || type === 'crops') {
      // Crop suggestions
      const [cropSuggestions] = await pool.query(
        `SELECT DISTINCT crop as value, 'crop' as type, COUNT(*) as count
         FROM produce_listings
         WHERE crop LIKE ? AND status = 'active'
         GROUP BY crop
         ORDER BY count DESC
         LIMIT 5`,
        [searchTerm]
      );
      suggestions.push(...cropSuggestions);
    }

    if (type === 'all' || type === 'regions') {
      // Region suggestions
      const [regionSuggestions] = await pool.query(
        `SELECT DISTINCT region as value, 'region' as type, COUNT(*) as count
         FROM users
         WHERE region LIKE ? AND role = 'farmer'
         GROUP BY region
         ORDER BY count DESC
         LIMIT 5`,
        [searchTerm]
      );
      suggestions.push(...regionSuggestions);
    }

    if (type === 'all' || type === 'farmers') {
      // Farmer name suggestions
      const [farmerSuggestions] = await pool.query(
        `SELECT DISTINCT u.full_name as value, 'farmer' as type, COUNT(l.id) as count
         FROM users u
         LEFT JOIN produce_listings l ON u.id = l.farmer_user_id AND l.status = 'active'
         WHERE u.full_name LIKE ? AND u.role = 'farmer'
         GROUP BY u.full_name
         ORDER BY count DESC
         LIMIT 5`,
        [searchTerm]
      );
      suggestions.push(...farmerSuggestions);
    }

    // Sort by relevance and count
    suggestions.sort((a, b) => {
      if (a.value.toLowerCase().startsWith(q.toLowerCase())) return -1;
      if (b.value.toLowerCase().startsWith(q.toLowerCase())) return 1;
      return b.count - a.count;
    });

    res.json({ suggestions: suggestions.slice(0, 10) });

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ error: "Failed to get search suggestions" });
  }
};

// Get popular search terms
export const getPopularSearches = async (req, res) => {
  try {
    const { period = 'month', limit = 10 } = req.query;

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === 'month') {
      dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    } else if (period === 'quarter') {
      dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
    }

    // Get popular crops
    const [popularCrops] = await pool.query(
      `SELECT
        crop as term,
        COUNT(*) as count,
        'crop' as type
       FROM produce_listings
       WHERE status = 'active' ${dateFilter}
       GROUP BY crop
       ORDER BY count DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    // Get popular regions
    const [popularRegions] = await pool.query(
      `SELECT
        region as term,
        COUNT(*) as count,
        'region' as type
       FROM produce_listings
       WHERE status = 'active' ${dateFilter}
       GROUP BY region
       ORDER BY count DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    // Combine and sort by popularity
    const allTerms = [...popularCrops, ...popularRegions];
    allTerms.sort((a, b) => b.count - a.count);

    res.json({
      period,
      popularTerms: allTerms.slice(0, limit),
      summary: {
        totalCrops: popularCrops.length,
        totalRegions: popularRegions.length,
        mostPopular: allTerms[0] || null
      }
    });

  } catch (error) {
    console.error('Error getting popular searches:', error);
    res.status(500).json({ error: "Failed to get popular searches" });
  }
};

// Get search analytics for admin
export const getSearchAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === 'month') {
      dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    } else if (period === 'quarter') {
      dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
    } else if (period === 'year') {
      dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
    }

    // Get search trends over time
    const [searchTrends] = await pool.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as search_count,
        COUNT(DISTINCT user_id) as unique_users
       FROM search_logs
       WHERE 1=1 ${dateFilter}
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`
    );

    // Get top search terms
    const [topTerms] = await pool.query(
      `SELECT
        search_term,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
       FROM search_logs
       WHERE 1=1 ${dateFilter}
       GROUP BY search_term
       ORDER BY count DESC
       LIMIT 20`
    );

    // Get search performance metrics
    const [performanceMetrics] = await pool.query(
      `SELECT
        COUNT(*) as total_searches,
        COUNT(DISTINCT user_id) as unique_searchers,
        AVG(result_count) as avg_results,
        AVG(CASE WHEN result_count = 0 THEN 1 ELSE 0 END) * 100 as zero_result_rate
       FROM search_logs
       WHERE 1=1 ${dateFilter}`
    );

    res.json({
      period,
      searchTrends,
      topTerms,
      performanceMetrics: performanceMetrics[0] || {
        total_searches: 0,
        unique_searchers: 0,
        avg_results: 0,
        zero_result_rate: 0
      }
    });

  } catch (error) {
    console.error('Error getting search analytics:', error);
    res.status(500).json({ error: "Failed to get search analytics" });
  }
};

