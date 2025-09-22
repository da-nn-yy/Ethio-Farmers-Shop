import { pool } from '../config/database.js';

// Get farmer profile with enhanced details
export const getFarmerProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Get user ID from firebase_uid
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = ?',
      [uid]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userRows[0].id;
    
    // Get farmer profile with all details
    const [profileRows] = await pool.query(
      `SELECT 
        fp.*,
        u.full_name,
        u.email,
        u.phone,
        u.region,
        u.woreda,
        u.avg_rating,
        u.review_count,
        u.created_at as member_since
       FROM farmer_profiles fp
       JOIN users u ON fp.user_id = u.id
       WHERE fp.user_id = ?`,
      [userId]
    );
    
    if (profileRows.length === 0) {
      // Create empty profile if it doesn't exist
      await pool.query(
        'INSERT INTO farmer_profiles (user_id) VALUES (?)',
        [userId]
      );
      
      // Return empty profile
      return res.json({
        user_id: userId,
        farm_name: null,
        farm_size_ha: null,
        farm_size_unit: 'hectares',
        certifications: null,
        crops: null,
        experience_years: null,
        address: null,
        farming_methods: null,
        seasonal_availability: 'year-round',
        business_hours_start: null,
        business_hours_end: null,
        farm_description: null,
        farm_description_am: null,
        specializations: null,
        equipment: null,
        irrigation_type: null,
        soil_type: null,
        organic_certified: false,
        fair_trade_certified: false,
        gmo_free: true,
        sustainability_practices: null,
        full_name: null,
        email: null,
        phone: null,
        region: null,
        woreda: null,
        avg_rating: null,
        review_count: 0,
        member_since: null
      });
    }
    
    const profile = profileRows[0];
    
    // Parse JSON fields
    const parsedProfile = {
      ...profile,
      certifications: profile.certifications ? JSON.parse(profile.certifications) : null,
      crops: profile.crops ? JSON.parse(profile.crops) : null,
      farming_methods: profile.farming_methods ? JSON.parse(profile.farming_methods) : null,
      specializations: profile.specializations ? JSON.parse(profile.specializations) : null,
      equipment: profile.equipment ? JSON.parse(profile.equipment) : null,
      sustainability_practices: profile.sustainability_practices ? JSON.parse(profile.sustainability_practices) : null
    };
    
    res.json(parsedProfile);
  } catch (error) {
    console.error('Error fetching farmer profile:', error);
    res.status(500).json({ error: 'Failed to fetch farmer profile' });
  }
};

// Update farmer profile
export const updateFarmerProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const {
      farm_name,
      farm_size_ha,
      farm_size_unit,
      certifications,
      crops,
      experience_years,
      address,
      farming_methods,
      seasonal_availability,
      business_hours_start,
      business_hours_end,
      farm_description,
      farm_description_am,
      specializations,
      equipment,
      irrigation_type,
      soil_type,
      organic_certified,
      fair_trade_certified,
      gmo_free,
      sustainability_practices
    } = req.body;
    
    // Get user ID from firebase_uid
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = ?',
      [uid]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userRows[0].id;
    
    // Check if profile exists
    const [existingProfile] = await pool.query(
      'SELECT user_id FROM farmer_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (existingProfile.length === 0) {
      // Create new profile
      await pool.query(
        `INSERT INTO farmer_profiles (
          user_id, farm_name, farm_size_ha, farm_size_unit, certifications, crops,
          experience_years, address, farming_methods, seasonal_availability,
          business_hours_start, business_hours_end, farm_description, farm_description_am,
          specializations, equipment, irrigation_type, soil_type, organic_certified,
          fair_trade_certified, gmo_free, sustainability_practices
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, farm_name, farm_size_ha, farm_size_unit,
          certifications ? JSON.stringify(certifications) : null,
          crops ? JSON.stringify(crops) : null,
          experience_years, address,
          farming_methods ? JSON.stringify(farming_methods) : null,
          seasonal_availability, business_hours_start, business_hours_end,
          farm_description, farm_description_am,
          specializations ? JSON.stringify(specializations) : null,
          equipment ? JSON.stringify(equipment) : null,
          irrigation_type, soil_type, organic_certified, fair_trade_certified,
          gmo_free, sustainability_practices ? JSON.stringify(sustainability_practices) : null
        ]
      );
    } else {
      // Update existing profile
      await pool.query(
        `UPDATE farmer_profiles SET
          farm_name = COALESCE(?, farm_name),
          farm_size_ha = COALESCE(?, farm_size_ha),
          farm_size_unit = COALESCE(?, farm_size_unit),
          certifications = COALESCE(?, certifications),
          crops = COALESCE(?, crops),
          experience_years = COALESCE(?, experience_years),
          address = COALESCE(?, address),
          farming_methods = COALESCE(?, farming_methods),
          seasonal_availability = COALESCE(?, seasonal_availability),
          business_hours_start = COALESCE(?, business_hours_start),
          business_hours_end = COALESCE(?, business_hours_end),
          farm_description = COALESCE(?, farm_description),
          farm_description_am = COALESCE(?, farm_description_am),
          specializations = COALESCE(?, specializations),
          equipment = COALESCE(?, equipment),
          irrigation_type = COALESCE(?, irrigation_type),
          soil_type = COALESCE(?, soil_type),
          organic_certified = COALESCE(?, organic_certified),
          fair_trade_certified = COALESCE(?, fair_trade_certified),
          gmo_free = COALESCE(?, gmo_free),
          sustainability_practices = COALESCE(?, sustainability_practices),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [
          farm_name, farm_size_ha, farm_size_unit,
          certifications ? JSON.stringify(certifications) : null,
          crops ? JSON.stringify(crops) : null,
          experience_years, address,
          farming_methods ? JSON.stringify(farming_methods) : null,
          seasonal_availability, business_hours_start, business_hours_end,
          farm_description, farm_description_am,
          specializations ? JSON.stringify(specializations) : null,
          equipment ? JSON.stringify(equipment) : null,
          irrigation_type, soil_type, organic_certified, fair_trade_certified,
          gmo_free, sustainability_practices ? JSON.stringify(sustainability_practices) : null,
          userId
        ]
      );
    }
    
    // Return updated profile
    const [updatedProfile] = await pool.query(
      `SELECT 
        fp.*,
        u.full_name,
        u.email,
        u.phone,
        u.region,
        u.woreda,
        u.avg_rating,
        u.review_count,
        u.created_at as member_since
       FROM farmer_profiles fp
       JOIN users u ON fp.user_id = u.id
       WHERE fp.user_id = ?`,
      [userId]
    );
    
    const profile = updatedProfile[0];
    const parsedProfile = {
      ...profile,
      certifications: profile.certifications ? JSON.parse(profile.certifications) : null,
      crops: profile.crops ? JSON.parse(profile.crops) : null,
      farming_methods: profile.farming_methods ? JSON.parse(profile.farming_methods) : null,
      specializations: profile.specializations ? JSON.parse(profile.specializations) : null,
      equipment: profile.equipment ? JSON.parse(profile.equipment) : null,
      sustainability_practices: profile.sustainability_practices ? JSON.parse(profile.sustainability_practices) : null
    };
    
    res.json(parsedProfile);
  } catch (error) {
    console.error('Error updating farmer profile:', error);
    res.status(500).json({ error: 'Failed to update farmer profile' });
  }
};

// Get farmer profile statistics
export const getFarmerProfileStats = async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Get user ID from firebase_uid
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = ?',
      [uid]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userRows[0].id;
    
    // Get comprehensive statistics
    const [stats] = await pool.query(
      `SELECT 
        -- Profile completion
        CASE 
          WHEN fp.farm_name IS NOT NULL AND fp.farm_size_ha IS NOT NULL 
               AND fp.crops IS NOT NULL AND fp.farming_methods IS NOT NULL
          THEN 100
          ELSE (
            (CASE WHEN fp.farm_name IS NOT NULL THEN 25 ELSE 0 END) +
            (CASE WHEN fp.farm_size_ha IS NOT NULL THEN 25 ELSE 0 END) +
            (CASE WHEN fp.crops IS NOT NULL THEN 25 ELSE 0 END) +
            (CASE WHEN fp.farming_methods IS NOT NULL THEN 25 ELSE 0 END)
          )
        END as profile_completion,
        
        -- Business metrics
        COUNT(DISTINCT pl.id) as total_listings,
        COUNT(DISTINCT CASE WHEN pl.status = 'active' THEN pl.id END) as active_listings,
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_earnings,
        COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount END), 0) as avg_order_value,
        
        -- Rating and reviews
        u.avg_rating,
        u.review_count,
        
        -- Profile details
        fp.experience_years,
        fp.organic_certified,
        fp.fair_trade_certified,
        fp.gmo_free,
        fp.farm_size_ha,
        fp.farm_size_unit
        
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       LEFT JOIN produce_listings pl ON u.id = pl.farmer_user_id
       LEFT JOIN orders o ON u.id = o.farmer_user_id
       WHERE u.id = ?
       GROUP BY u.id, fp.farm_name, fp.farm_size_ha, fp.crops, fp.farming_methods, 
                fp.experience_years, fp.organic_certified, fp.fair_trade_certified, 
                fp.gmo_free, fp.farm_size_unit, u.avg_rating, u.review_count`,
      [userId]
    );
    
    const [recentActivity] = await pool.query(
      `SELECT 
        'listing' as type,
        pl.title as title,
        pl.created_at as created_at,
        pl.status as status
       FROM produce_listings pl
       WHERE pl.farmer_user_id = ?
       
       UNION ALL
       
       SELECT 
        'order' as type,
        CONCAT('Order #', o.id) as title,
        o.created_at as created_at,
        o.status as status
       FROM orders o
       WHERE o.farmer_user_id = ?
       
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId, userId]
    );
    
    res.json({
      stats: stats[0] || {
        profile_completion: 0,
        total_listings: 0,
        active_listings: 0,
        total_orders: 0,
        completed_orders: 0,
        total_earnings: 0,
        avg_order_value: 0,
        avg_rating: 0,
        review_count: 0,
        experience_years: 0,
        organic_certified: false,
        fair_trade_certified: false,
        gmo_free: true,
        farm_size_ha: 0,
        farm_size_unit: 'hectares'
      },
      recent_activity: recentActivity
    });
  } catch (error) {
    console.error('Error fetching farmer profile stats:', error);
    res.status(500).json({ error: 'Failed to fetch farmer profile statistics' });
  }
};

// Upload certification document
export const uploadCertification = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const uid = req.user.uid;
    const { certification_type, certification_body, issue_date, expiry_date } = req.body;
    
    // Get user ID from firebase_uid
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = ?',
      [uid]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userRows[0].id;
    
    // Create certifications table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmer_certifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id BIGINT NOT NULL,
        certification_type VARCHAR(255) NOT NULL,
        certification_body VARCHAR(255) NOT NULL,
        document_url VARCHAR(1024) NOT NULL,
        issue_date DATE NULL,
        expiry_date DATE NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (farmer_id),
        CONSTRAINT fk_certification_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    const documentUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // Insert certification record
    const [result] = await pool.query(
      `INSERT INTO farmer_certifications 
       (farmer_id, certification_type, certification_body, document_url, issue_date, expiry_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, certification_type, certification_body, documentUrl, issue_date, expiry_date]
    );
    
    res.status(201).json({
      message: 'Certification uploaded successfully',
      certification_id: result.insertId,
      document_url: documentUrl
    });
  } catch (error) {
    console.error('Error uploading certification:', error);
    res.status(500).json({ error: 'Failed to upload certification' });
  }
};

// Get farmer certifications
export const getFarmerCertifications = async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Get user ID from firebase_uid
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = ?',
      [uid]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userRows[0].id;
    
    // Check if certifications table exists
    const [tableExists] = await pool.query(
      "SHOW TABLES LIKE 'farmer_certifications'"
    );
    
    if (tableExists.length === 0) {
      return res.json([]);
    }
    
    const [certifications] = await pool.query(
      `SELECT * FROM farmer_certifications 
       WHERE farmer_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json(certifications);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
};
