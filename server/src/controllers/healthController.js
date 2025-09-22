import { pool } from '../config/database.js';

// Health check endpoint with database connectivity test
export const healthCheck = async (req, res) => {
  try {
    // Test database connection
    const [rows] = await pool.query('SELECT 1 as test');
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        test: rows[0].test
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      },
      environment: process.env.NODE_ENV || 'development'
    });
  }
};

// Database schema check endpoint
export const schemaCheck = async (req, res) => {
  try {
    // Check if required tables exist
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('users', 'farmer_profiles', 'produce_listings', 'orders')
    `);
    
    const existingTables = tables.map(row => row.TABLE_NAME);
    const requiredTables = ['users', 'farmer_profiles', 'produce_listings', 'orders'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    // Check produce_listings schema
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'produce_listings'
      ORDER BY ORDINAL_POSITION
    `);
    
    res.json({
      status: 'OK',
      tables: {
        existing: existingTables,
        missing: missingTables,
        allPresent: missingTables.length === 0
      },
      produce_listings_schema: columns,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Schema check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
