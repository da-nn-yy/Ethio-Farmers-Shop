import 'dotenv/config';
import { pool } from '../src/config/database.js';

const crops = ['teff', 'wheat', 'maize'];
const regions = ['Addis Ababa', 'Oromia', 'Amhara'];

const daysBack = 180;

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const rand = (min, max) => Math.random() * (max - min) + min;

async function ensureTables() {
  await pool.query(`CREATE TABLE IF NOT EXISTS market_series (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    crop VARCHAR(128) NOT NULL,
    region VARCHAR(128) NOT NULL,
    date DATE NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    volume DECIMAL(12,2) NULL,
    source VARCHAR(64) NULL,
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ms_crop_region_date (crop, region, date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
}

async function seedSeries() {
  await ensureTables();

  // Clear existing sample data for these crops/regions
  await pool.query(
    `DELETE FROM market_series WHERE crop IN (?) AND region IN (?)`,
    [crops, regions]
  );

  const rows = [];
  for (const crop of crops) {
    for (const region of regions) {
      const base = crop === 'teff' ? 40 : crop === 'wheat' ? 32 : 28;
      for (let i = daysBack; i >= 0; i--) {
        const date = daysFromNow(-i);
        const price = base + Math.sin(i / 12) * 2 + rand(-1, 1);
        const volume = 80 + Math.cos(i / 10) * 10 + rand(-5, 5);
        rows.push([crop, region, date, price.toFixed(2), volume.toFixed(2), 'seed']);
      }
    }
  }

  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await pool.query(
      `INSERT INTO market_series (crop, region, date, price, volume, source)
       VALUES ?`,
      [chunk]
    );
  }
}

seedSeries()
  .then(() => {
    console.log('✅ Seeded market_series with sample data');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  });
