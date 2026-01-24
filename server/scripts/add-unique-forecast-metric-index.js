import 'dotenv/config';
import { pool } from '../src/config/database.js';

async function ensureForecastMetricsTable() {
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
    INDEX idx_fm_crop_region (crop, region)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
}

async function indexExists() {
  const [rows] = await pool.query(
    `SHOW INDEX FROM forecast_metrics WHERE Key_name = ?`,
    ['uniq_metric']
  );
  return rows.length > 0;
}

async function addUniqueIndex() {
  await pool.query(
    `ALTER TABLE forecast_metrics
     ADD UNIQUE KEY uniq_metric (crop, region, model_name, model_version, period)`
  );
}

(async function run() {
  try {
    await ensureForecastMetricsTable();
    const exists = await indexExists();
    if (exists) {
      console.log('ℹ️  Unique index \'uniq_metric\' already exists on forecast_metrics.');
      process.exit(0);
    }
    await addUniqueIndex();
    console.log('✅ Added unique index \'uniq_metric\' to forecast_metrics.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
})();
