#!/usr/bin/env node
/**
 * Create test listings for testing duplicate functionality
 */

import { pool } from './src/config/database.js';

async function createTestListings() {
  try {
    console.log('🌱 Creating test listings...');
    
    // First, create a test user if it doesn't exist
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = ?',
      ['test-farmer-123']
    );
    
    let farmerId;
    if (userRows.length === 0) {
      console.log('Creating test farmer user...');
      const [userResult] = await pool.query(
        'INSERT INTO users (firebase_uid, role, full_name, phone, email, region, woreda) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['test-farmer-123', 'farmer', 'Test Farmer', '+251900000000', 'test@example.com', 'Addis Ababa', 'Bole']
      );
      farmerId = userResult.insertId;
      
      // Create farmer profile
      await pool.query(
        'INSERT INTO farmer_profiles (user_id, farm_name, farm_size_ha, experience_years, address) VALUES (?, ?, ?, ?, ?)',
        [farmerId, 'Test Farm', 10.0, 5, 'Addis Ababa, Ethiopia']
      );
    } else {
      farmerId = userRows[0].id;
    }
    
    // Clear existing test listings
    await pool.query('DELETE FROM produce_listings WHERE farmer_user_id = ?', [farmerId]);
    console.log('✅ Cleared existing test listings');
    
    // Create test listings
    const testListings = [
      {
        title: 'Fresh Tomatoes',
        crop: 'vegetables',
        variety: 'Roma',
        quantity: 100,
        unit: 'kg',
        price_per_unit: 25.00,
        currency: 'ETB',
        region: 'Addis Ababa',
        woreda: 'Bole',
        description: 'Fresh organic tomatoes from our farm',
        status: 'active'
      },
      {
        title: 'Green Beans',
        crop: 'vegetables',
        variety: 'String Beans',
        quantity: 50,
        unit: 'kg',
        price_per_unit: 30.00,
        currency: 'ETB',
        region: 'Addis Ababa',
        woreda: 'Kirkos',
        description: 'Fresh green beans, perfect for cooking',
        status: 'active'
      },
      {
        title: 'Red Onions',
        crop: 'vegetables',
        variety: 'Red Onion',
        quantity: 75,
        unit: 'kg',
        price_per_unit: 20.00,
        currency: 'ETB',
        region: 'Addis Ababa',
        woreda: 'Nifas Silk-Lafto',
        description: 'Fresh red onions, great for cooking',
        status: 'active'
      }
    ];
    
    for (const listing of testListings) {
      const [result] = await pool.query(
        `INSERT INTO produce_listings (
          farmer_user_id, title, crop, variety, quantity, unit,
          price_per_unit, currency, region, woreda, description, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          farmerId, listing.title, listing.crop, listing.variety, listing.quantity,
          listing.unit, listing.price_per_unit, listing.currency, listing.region,
          listing.woreda, listing.description, listing.status
        ]
      );
      
      console.log(`✅ Created listing: ${listing.title} (ID: ${result.insertId})`);
    }
    
    console.log('🎉 Test listings created successfully!');
    console.log(`📊 Created ${testListings.length} test listings for farmer ID: ${farmerId}`);
    
  } catch (error) {
    console.error('❌ Error creating test listings:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
createTestListings();
