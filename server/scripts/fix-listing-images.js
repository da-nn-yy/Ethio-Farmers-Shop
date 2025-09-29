import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const serverEnvPath = path.join(process.cwd(), 'server', '.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else {
  dotenv.config();
}

(async () => {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const dbName = process.env.DB_NAME || 'farmconnect';

  let conn;
  try {
    conn = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: dbPort
    });

    await conn.query(`USE \`${dbName}\``);

    console.log('🔍 Checking listing_images table...');

    // Check if listing_images table exists
    const [tables] = await conn.query(
      "SHOW TABLES LIKE 'listing_images'"
    );

    if (tables.length === 0) {
      console.log('❌ listing_images table does not exist. Creating it...');

      await conn.query(`
        CREATE TABLE IF NOT EXISTS listing_images (
          id INT PRIMARY KEY AUTO_INCREMENT,
          listing_id INT NOT NULL,
          url TEXT NOT NULL,
          sort_order INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_image_listing FOREIGN KEY (listing_id) REFERENCES produce_listings(id) ON DELETE CASCADE,
          INDEX idx_images_listing (listing_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      console.log('✅ listing_images table created');
    } else {
      console.log('✅ listing_images table exists');
    }

    // Check table schema first
    const [columns] = await conn.query(`
      DESCRIBE produce_listings
    `);

    console.log('📋 produce_listings table schema:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    // Check current listings with correct column names
    const [listings] = await conn.query(`
      SELECT id, title, crop, variety
      FROM produce_listings
      ORDER BY id DESC
      LIMIT 10
    `);

    console.log(`📊 Found ${listings.length} listings:`);
    listings.forEach(listing => {
      console.log(`  - ID: ${listing.id}, Title: ${listing.title}, Crop: ${listing.crop}, Variety: ${listing.variety}`);
    });

    // Check current images
    const [images] = await conn.query(`
      SELECT li.listing_id, li.url, pl.title, pl.crop
      FROM listing_images li
      JOIN produce_listings pl ON li.listing_id = pl.id
      ORDER BY li.listing_id DESC
      LIMIT 10
    `);

    console.log(`🖼️  Found ${images.length} images in listing_images table:`);
    images.forEach(img => {
      console.log(`  - Listing ID: ${img.listing_id}, Title: ${img.title}, Crop: ${img.crop}, URL: ${img.url}`);
    });

    // Since there are no image columns in the current schema, let's add sample images
    console.log('🖼️  Adding sample images for all listings...');

    const [allListings] = await conn.query(`
      SELECT id, title, crop, variety
      FROM produce_listings
      ORDER BY id
    `);

    const sampleImages = {
      'tomato': 'https://images.pexels.com/photos/4110404/pexels-photo-4110404.jpeg',
      'onion': 'https://images.pexels.com/photos/4110404/pexels-photo-4110404.jpeg',
      'potato': 'https://images.pexels.com/photos/4110404/pexels-photo-4110404.jpeg',
      'carrot': 'https://images.pexels.com/photos/4110404/pexels-photo-4110404.jpeg',
      'cabbage': 'https://images.pexels.com/photos/4110404/pexels-photo-4110404.jpeg',
      'timatimmm': 'https://images.pexels.com/photos/4110404/pexels-photo-4110404.jpeg',
      'default': 'https://images.pexels.com/photos/4110404/pexels-photo-4110404.jpeg'
    };

    let addedCount = 0;
    for (const listing of allListings) {
      // Check if image already exists in listing_images
      const [existing] = await conn.query(
        'SELECT id FROM listing_images WHERE listing_id = ?',
        [listing.id]
      );

      if (existing.length === 0) {
        const crop = (listing.crop || listing.title || 'default').toLowerCase();
        const imageUrl = sampleImages[crop] || sampleImages['default'];

        await conn.query(
          'INSERT INTO listing_images (listing_id, url, sort_order) VALUES (?, ?, 0)',
          [listing.id, imageUrl]
        );
        addedCount++;
        console.log(`  ✅ Added image for listing ${listing.id}: ${listing.title} (${listing.crop})`);
      }
    }

    console.log(`🎉 Added ${addedCount} images.`);

    // Final verification
    const [finalImages] = await conn.query(`
      SELECT COUNT(*) as total FROM listing_images
    `);

    console.log(`📊 Final count: ${finalImages[0].total} images in listing_images table`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
