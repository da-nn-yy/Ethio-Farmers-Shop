import 'dotenv/config';
import { pool } from '../src/config/database.js';

const crops = ['teff', 'wheat', 'maize'];
const regions = ['Addis Ababa', 'Oromia', 'Amhara'];
const horizons = [7, 30, 90];

const today = () => new Date();
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

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

  await pool.query(`CREATE TABLE IF NOT EXISTS market_forecasts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    crop VARCHAR(128) NOT NULL,
    region VARCHAR(128) NOT NULL,
    horizon INT NOT NULL,
    date DATE NOT NULL,
    price_pred DECIMAL(12,2) NOT NULL,
    lower DECIMAL(12,2) NULL,
    upper DECIMAL(12,2) NULL,
    model_name VARCHAR(128) NOT NULL,
    model_version VARCHAR(128) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mf_crop_region_horizon_date (crop, region, horizon, date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  await pool.query(`CREATE TABLE IF NOT EXISTS forecast_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    crop VARCHAR(128) NOT NULL,
    region VARCHAR(128) NOT NULL,
    model_name VARCHAR(128) NOT NULL,
    model_version VARCHAR(128) NOT NULL,
    period INT NOT NULL,
    mape DECIMAL(12,4) NULL,
    mae DECIMAL(12,4) NULL,
    rmse DECIMAL(12,4) NULL,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fm_model (model_name, model_version),
    INDEX idx_fm_crop_region (crop, region),
    UNIQUE KEY uniq_metric (crop, region, model_name, model_version, period)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
}

async function getLastPrice(crop, region) {
  const [rows] = await pool.query(
    `SELECT price FROM market_series WHERE crop = ? AND region = ? ORDER BY date DESC LIMIT 1`,
    [crop, region]
  );
  return rows[0]?.price ?? null;
}

async function seedForecasts() {
  await ensureTables();

  const version = `baseline-${daysFromNow(0)}`;
  const modelName = 'baseline-linear';

  // Clear existing seeded forecasts for these crops/regions/version
  await pool.query(
    `DELETE FROM market_forecasts WHERE model_version = ?`,
    [version]
  );

  for (const crop of crops) {
    for (const region of regions) {
      const lastPrice = await getLastPrice(crop, region);
      if (lastPrice == null) continue;

      for (const horizon of horizons) {
        const rows = [];
        for (let i = 1; i <= horizon; i++) {
          // Simple baseline: slight upward drift + small noise band
          const drift = (horizon === 90 ? 0.12 : horizon === 30 ? 0.08 : 0.03) * (i / horizon);
          const pricePred = Number(lastPrice) * (1 + drift);
          const lower = pricePred * 0.95;
          const upper = pricePred * 1.05;
          rows.push([crop, region, horizon, daysFromNow(i), pricePred.toFixed(2), lower.toFixed(2), upper.toFixed(2), modelName, version]);
        }

        const chunkSize = 200;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          await pool.query(
            `INSERT INTO market_forecasts (crop, region, horizon, date, price_pred, lower, upper, model_name, model_version)
             VALUES ?`,
            [chunk]
          );
        }
      }

      // Store a dummy metric row
      await pool.query(
        `DELETE FROM forecast_metrics WHERE crop = ? AND region = ? AND model_name = ? AND model_version = ? AND period = 180`,
        [crop, region, modelName, version]
      );
      await pool.query(
        `INSERT INTO forecast_metrics (crop, region, model_name, model_version, period, mape, mae, rmse)
         VALUES (?, ?, ?, ?, 180, 0.12, 1.8, 2.3)
         ON DUPLICATE KEY UPDATE mape = VALUES(mape), mae = VALUES(mae), rmse = VALUES(rmse), computed_at = CURRENT_TIMESTAMP`,
        [crop, region, modelName, version]
      );
    }
  }
}

seedForecasts()
  .then(() => {
    console.log('✅ Seeded market_forecasts with baseline data');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Forecast seeding failed:', err.message);
    process.exit(1);
  });
