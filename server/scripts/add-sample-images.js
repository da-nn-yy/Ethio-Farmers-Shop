#!/usr/bin/env node
/**
 * Add sample images to existing listings that don't have images
 */

import { pool } from './src/config/database.js';

async function addSampleImages() {
  try {
    console.log('🖼️ Adding sample images to existing listings...');
    
    // Get listings without images
    const [listingsWithoutImages] = await pool.query(`
      SELECT pl.id, pl.title, pl.crop 
      FROM produce_listings pl 
      LEFT JOIN listing_images li ON pl.id = li.listing_id 
      WHERE li.id IS NULL AND pl.status = 'active'
      ORDER BY pl.id
    `);
    
    console.log(`📊 Found ${listingsWithoutImages.length} listings without images`);
    
    // Sample images for different categories
    const sampleImages = {
      'vegetables': 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg',
      'fruits': 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg',
      'grains': 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg',
      'legumes': 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg',
      'spices': 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg',
      'other': 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg'
    };
    
    for (const listing of listingsWithoutImages) {
      const category = listing.crop || 'other';
      const imageUrl = sampleImages[category] || sampleImages['other'];
      
      // Add image to listing
      await pool.query(
        'INSERT INTO listing_images (listing_id, url, sort_order) VALUES (?, ?, 0)',
        [listing.id, imageUrl]
      );
      
      console.log(`✅ Added ${category} image to listing ${listing.id}: ${listing.title}`);
    }
    
    console.log('\n🎉 Sample images added successfully!');
    
    // Show updated results
    console.log('\n📊 Updated listings with images:');
    const [updatedListings] = await pool.query(`
      SELECT pl.id, pl.title, pl.crop, li.url as image_url
      FROM produce_listings pl 
      LEFT JOIN listing_images li ON pl.id = li.listing_id 
      WHERE pl.status = 'active'
      ORDER BY pl.id
    `);
    
    updatedListings.forEach(listing => {
      console.log(`ID: ${listing.id}, Title: ${listing.title}, Category: ${listing.crop}, Image: ${listing.image_url ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding sample images:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
addSampleImages();
