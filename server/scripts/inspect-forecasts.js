import 'dotenv/config';
import { pool } from '../src/config/database.js';

async function main() {
  try {
    const [versions] = await pool.query(
      `SELECT crop, region, horizon, model_version, COUNT(*) as cnt
       FROM market_forecasts
       GROUP BY crop, region, horizon, model_version
       ORDER BY crop, region, horizon`
    );
    console.log('Versions/horizons:', versions);

    const [sample] = await pool.query(
      `SELECT date, price_pred, model_name, model_version
       FROM market_forecasts
       WHERE crop = ? AND region = ? AND horizon = ?
       ORDER BY date ASC LIMIT 3`,
      ['teff', 'Addis Ababa', 30]
    );
    console.log('Sample teff/Addis/30:', sample);
  } catch (e) {
    console.error('inspect error:', e);
  } finally {
    process.exit(0);
  }
}

main();
