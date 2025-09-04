import { pool } from "../config/db.js";

// Get price trends for specific crops and regions
export const getPriceTrends = async (req, res) => {
  try {
    const { crop, region, woreda, period = 'month', limit = 30 } = req.query;

    if (!crop) {
      return res.status(400).json({ error: "Crop parameter is required" });
    }

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    } else if (period === 'month') {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
    } else if (period === 'quarter') {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
    } else if (period === 'year') {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
    }

    let whereClause = "WHERE crop = ?";
    let params = [crop];

    if (region) {
      whereClause += " AND region = ?";
      params.push(region);
    }

    if (woreda) {
      whereClause += " AND woreda = ?";
      params.push(woreda);
    }

    const [trends] = await pool.query(
      `SELECT
        date,
        avg_price,
        currency,
        region,
        woreda
      FROM price_trends
      ${whereClause} ${dateFilter}
      ORDER BY date DESC
      LIMIT ?`,
      [...params, parseInt(limit)]
    );

    // Calculate price statistics
    if (trends.length > 0) {
      const prices = trends.map(t => t.avg_price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      // Calculate price change percentage
      const latestPrice = trends[0].avg_price;
      const oldestPrice = trends[trends.length - 1].avg_price;
      const priceChange = oldestPrice > 0 ? ((latestPrice - oldestPrice) / oldestPrice) * 100 : 0;

      res.json({
        trends: trends.reverse(), // Return in chronological order
        statistics: {
          minPrice,
          maxPrice,
          avgPrice: Math.round(avgPrice * 100) / 100,
          latestPrice,
          priceChange: Math.round(priceChange * 100) / 100,
          period
        }
      });
    } else {
      res.json({
        trends: [],
        statistics: {
          minPrice: 0,
          maxPrice: 0,
          avgPrice: 0,
          latestPrice: 0,
          priceChange: 0,
          period
        }
      });
    }
  } catch (error) {
    console.error('Error fetching price trends:', error);
    res.status(500).json({ error: "Failed to fetch price trends" });
  }
};

// Get market overview with popular crops and price summaries
export const getMarketOverview = async (req, res) => {
  try {
    const { region, woreda } = req.query;

    let whereClause = "WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    let params = [];

    if (region) {
      whereClause += " AND region = ?";
      params.push(region);
    }

    if (woreda) {
      whereClause += " AND woreda = ?";
      params.push(woreda);
    }

    // Get popular crops with current prices
    const [popularCrops] = await pool.query(
      `SELECT
        pt.crop,
        COUNT(*) as data_points,
        AVG(pt.avg_price) as avg_price,
        MIN(pt.avg_price) as min_price,
        MAX(pt.avg_price) as max_price,
        pt.currency
      FROM price_trends pt
      ${whereClause}
      GROUP BY pt.crop, pt.currency
      ORDER BY data_points DESC
      LIMIT 10`,
      params
    );

    // Get recent price changes
    const [recentChanges] = await pool.query(
      `SELECT
        pt1.crop,
        pt1.avg_price as current_price,
        pt2.avg_price as previous_price,
        pt1.currency,
        ROUND(((pt1.avg_price - pt2.avg_price) / pt2.avg_price) * 100, 2) as change_percentage
      FROM price_trends pt1
      JOIN (
        SELECT crop, region, woreda, currency, MAX(date) as max_date
        FROM price_trends
        ${whereClause}
        GROUP BY crop, region, woreda, currency
      ) pt_max ON pt1.crop = pt_max.crop
        AND (pt1.region = pt_max.region OR (pt1.region IS NULL AND pt_max.region IS NULL))
        AND (pt1.woreda = pt_max.woreda OR (pt1.woreda IS NULL AND pt_max.woreda IS NULL))
        AND pt1.date = pt_max.max_date
      JOIN price_trends pt2 ON pt1.crop = pt2.crop
        AND (pt1.region = pt2.region OR (pt1.region IS NULL AND pt2.region IS NULL))
        AND (pt1.woreda = pt2.woreda OR (pt1.woreda IS NULL AND pt2.woreda IS NULL))
        AND pt2.date = DATE_SUB(pt1.date, INTERVAL 7 DAY)
      ORDER BY ABS(change_percentage) DESC
      LIMIT 5`,
      params
    );

    // Get market activity summary
    const [marketActivity] = await pool.query(
      `SELECT
        COUNT(DISTINCT pt.crop) as active_crops,
        COUNT(*) as total_price_points,
        AVG(pt.avg_price) as overall_avg_price,
        pt.currency
      FROM price_trends pt
      ${whereClause}
      GROUP BY pt.currency`,
      params
    );

    res.json({
      popularCrops,
      recentChanges,
      marketActivity: marketActivity[0] || {
        active_crops: 0,
        total_price_points: 0,
        overall_avg_price: 0,
        currency: 'ETB'
      }
    });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: "Failed to fetch market overview" });
  }
};

// Get seasonal insights for crops
export const getSeasonalInsights = async (req, res) => {
  try {
    const { crop, region, woreda } = req.query;

    if (!crop) {
      return res.status(400).json({ error: "Crop parameter is required" });
    }

    let whereClause = "WHERE crop = ?";
    let params = [crop];

    if (region) {
      whereClause += " AND region = ?";
      params.push(region);
    }

    if (woreda) {
      whereClause += " AND woreda = ?";
      params.push(woreda);
    }

    // Get monthly average prices for the last 2 years
    const [monthlyTrends] = await pool.query(
      `SELECT
        YEAR(date) as year,
        MONTH(date) as month,
        AVG(avg_price) as avg_price,
        COUNT(*) as data_points
      FROM price_trends
      ${whereClause}
      AND date >= DATE_SUB(CURDATE(), INTERVAL 2 YEAR)
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY year, month`,
      params
    );

    // Get seasonal patterns
    const seasonalData = {};
    monthlyTrends.forEach(trend => {
      const monthName = new Date(2024, trend.month - 1, 1).toLocaleString('en-US', { month: 'long' });
      if (!seasonalData[monthName]) {
        seasonalData[monthName] = { prices: [], dataPoints: 0 };
      }
      seasonalData[monthName].prices.push(trend.avg_price);
      seasonalData[monthName].dataPoints += trend.data_points;
    });

    // Calculate seasonal averages
    const seasonalAverages = Object.entries(seasonalData).map(([month, data]) => ({
      month,
      avgPrice: data.prices.length > 0 ?
        Math.round((data.prices.reduce((a, b) => a + b, 0) / data.prices.length) * 100) / 100 : 0,
      dataPoints: data.dataPoints
    }));

    // Get current month vs historical average
    const currentMonth = new Date().getMonth();
    const currentMonthName = new Date(2024, currentMonth, 1).toLocaleString('en-US', { month: 'long' });
    const currentMonthData = seasonalAverages.find(s => s.month === currentMonthName);

    // Get best and worst months for pricing
    const sortedByPrice = [...seasonalAverages].sort((a, b) => b.avgPrice - a.avgPrice);
    const bestMonth = sortedByPrice[0];
    const worstMonth = sortedByPrice[sortedByPrice.length - 1];

    res.json({
      crop,
      region: region || 'All',
      woreda: woreda || 'All',
      seasonalAverages,
      insights: {
        currentMonth: currentMonthName,
        currentMonthData,
        bestMonth,
        worstMonth,
        priceRange: {
          min: worstMonth?.avgPrice || 0,
          max: bestMonth?.avgPrice || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching seasonal insights:', error);
    res.status(500).json({ error: "Failed to fetch seasonal insights" });
  }
};

// Get market comparison between regions
export const getMarketComparison = async (req, res) => {
  try {
    const { crop, regions, period = 'month' } = req.query;

    if (!crop) {
      return res.status(400).json({ error: "Crop parameter is required" });
    }

    if (!regions || !Array.isArray(regions) || regions.length < 2) {
      return res.status(400).json({ error: "At least 2 regions are required for comparison" });
    }

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    } else if (period === 'month') {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
    } else if (period === 'quarter') {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
    } else if (period === 'year') {
      dateFilter = "AND date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
    }

    const comparisonData = [];

    for (const region of regions) {
      const [regionData] = await pool.query(
        `SELECT
          region,
          AVG(avg_price) as avg_price,
          MIN(avg_price) as min_price,
          MAX(avg_price) as max_price,
          COUNT(*) as data_points,
          MAX(date) as latest_date
        FROM price_trends
        WHERE crop = ? AND region = ? ${dateFilter}
        GROUP BY region`,
        [crop, region]
      );

      if (regionData.length > 0) {
        comparisonData.push(regionData[0]);
      }
    }

    if (comparisonData.length === 0) {
      return res.status(404).json({ error: "No data found for the specified regions and crop" });
    }

    // Calculate price differences and rankings
    const sortedByPrice = [...comparisonData].sort((a, b) => b.avg_price - a.avg_price);
    const highestPrice = sortedByPrice[0];
    const lowestPrice = sortedByPrice[sortedByPrice.length - 1];
    const priceDifference = highestPrice.avg_price - lowestPrice.avg_price;
    const priceDifferencePercentage = (priceDifference / lowestPrice.avg_price) * 100;

    // Add rankings
    comparisonData.forEach((region, index) => {
      region.ranking = sortedByPrice.findIndex(r => r.region === region.region) + 1;
      region.priceDifference = region.avg_price - lowestPrice.avg_price;
      region.priceDifferencePercentage = (region.priceDifference / lowestPrice.avg_price) * 100;
    });

    res.json({
      crop,
      period,
      comparison: comparisonData,
      summary: {
        highestPriceRegion: highestPrice.region,
        lowestPriceRegion: lowestPrice.region,
        priceDifference: Math.round(priceDifference * 100) / 100,
        priceDifferencePercentage: Math.round(priceDifferencePercentage * 100) / 100,
        totalRegions: comparisonData.length
      }
    });
  } catch (error) {
    console.error('Error fetching market comparison:', error);
    res.status(500).json({ error: "Failed to fetch market comparison" });
  }
};

// Get popular produce based on listings and orders
export const getPopularProduce = async (req, res) => {
  try {
    const { region, woreda, period = 'month' } = req.query;

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND l.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === 'month') {
      dateFilter = "AND l.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    } else if (period === 'quarter') {
      dateFilter = "AND l.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
    } else if (period === 'year') {
      dateFilter = "AND l.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
    }

    let whereClause = "WHERE l.status = 'active'";
    let params = [];

    if (region) {
      whereClause += " AND l.region = ?";
      params.push(region);
    }

    if (woreda) {
      whereClause += " AND l.woreda = ?";
      params.push(woreda);
    }

    // Get popular crops by listing count and order volume
    const [popularCrops] = await pool.query(
      `SELECT
        l.crop,
        COUNT(DISTINCT l.id) as listing_count,
        SUM(l.quantity) as total_available,
        AVG(l.price_per_unit) as avg_price,
        l.currency,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity) as total_ordered
      FROM produce_listings l
      LEFT JOIN order_items oi ON l.id = oi.listing_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('confirmed', 'shipped', 'completed')
      ${whereClause} ${dateFilter}
      GROUP BY l.crop, l.currency
      ORDER BY listing_count DESC, order_count DESC
      LIMIT 15`,
      params
    );

    // Calculate popularity score and trends
    const enhancedCrops = popularCrops.map(crop => {
      const popularityScore = (crop.listing_count * 0.4) + (crop.order_count * 0.6);
      const demandRatio = crop.total_ordered > 0 ? crop.total_ordered / crop.total_available : 0;

      return {
        ...crop,
        popularityScore: Math.round(popularityScore * 100) / 100,
        demandRatio: Math.round(demandRatio * 100) / 100,
        marketActivity: crop.listing_count > 0 && crop.order_count > 0 ? 'High' :
                       crop.listing_count > 0 ? 'Medium' : 'Low'
      };
    });

    // Sort by popularity score
    enhancedCrops.sort((a, b) => b.popularityScore - a.popularityScore);

    res.json({
      period,
      region: region || 'All',
      woreda: woreda || 'All',
      popularCrops: enhancedCrops,
      summary: {
        totalCrops: enhancedCrops.length,
        highActivityCrops: enhancedCrops.filter(c => c.marketActivity === 'High').length,
        mediumActivityCrops: enhancedCrops.filter(c => c.marketActivity === 'Medium').length,
        lowActivityCrops: enhancedCrops.filter(c => c.marketActivity === 'Low').length
      }
    });
  } catch (error) {
    console.error('Error fetching popular produce:', error);
    res.status(500).json({ error: "Failed to fetch popular produce" });
  }
};

// Add new price data point (for admin/data collection)
export const addPriceData = async (req, res) => {
  try {
    const { crop, region, woreda, avgPrice, currency = 'ETB', date } = req.body;

    if (!crop || !avgPrice) {
      return res.status(400).json({ error: "Crop and average price are required" });
    }

    const priceDate = date || new Date().toISOString().split('T')[0];

    // Check if data already exists for this crop, region, woreda, and date
    const [existing] = await pool.query(
      "SELECT id FROM price_trends WHERE crop = ? AND region = ? AND woreda = ? AND date = ?",
      [crop, region || null, woreda || null, priceDate]
    );

    if (existing.length > 0) {
      // Update existing record
      await pool.query(
        "UPDATE price_trends SET avg_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [avgPrice, existing[0].id]
      );
    } else {
      // Insert new record
      await pool.query(
        "INSERT INTO price_trends (crop, region, woreda, date, avg_price, currency) VALUES (?, ?, ?, ?, ?, ?)",
        [crop, region || null, woreda || null, priceDate, avgPrice, currency]
      );
    }

    res.json({ message: "Price data added successfully" });
  } catch (error) {
    console.error('Error adding price data:', error);
    res.status(500).json({ error: "Failed to add price data" });
  }
};
