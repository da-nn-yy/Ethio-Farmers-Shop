import { pool } from "../config/database.js";

// Placeholder utilities to mock data; replace with real DB/ML service.
const now = () => new Date();
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

let tablesEnsured = false;
const ensureTables = async () => {
  if (tablesEnsured) return;
  tablesEnsured = true;
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const mockSeries = (period) => Array.from({ length: Math.min(Number(period) || 180, 365) }).map((_, i) => ({
  date: daysFromNow(-i),
  price: 40 + Math.sin(i / 14) * 3 + (Math.random() - 0.5) * 2,
  volume: Math.max(0, 100 + Math.cos(i / 10) * 15 + (Math.random() - 0.5) * 20),
})).reverse();

const mockForecast = (h) => Array.from({ length: h }).map((_, i) => ({
  date: daysFromNow(i + 1),
  price_pred: 42 + Math.sin(i / 10) * 2,
  lower: 40 + Math.sin(i / 10) * 2 - 2,
  upper: 44 + Math.sin(i / 10) * 2 + 2,
}));

// GET /market/trends
export const getMarketTrends = async (req, res) => {
  const { crop = "teff", region = "Addis Ababa", period = 180 } = req.query;
  try {
    await ensureTables();
    const [rows] = await pool.query(
      `SELECT date, price, volume
       FROM market_series
       WHERE crop = ? AND region = ?
         AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY date ASC`,
      [crop, region, Number(period) || 180]
    );

    const series = rows.length > 0 ? rows : mockSeries(period);

    res.json({
      success: true,
      series,
      meta: { crop, region, period: Number(period) || 180, source: rows.length > 0 ? "db" : "mock" }
    });
  } catch (err) {
    console.error("getMarketTrends error:", err.message);
    res.json({
      success: true,
      series: mockSeries(period),
      meta: { crop, region, period: Number(period) || 180, source: "mock", error: err.message }
    });
  }
};

// GET /market/forecasts
export const getMarketForecasts = async (req, res) => {
  const { crop = "teff", region = "Addis Ababa", horizon = 30, version } = req.query;
  const h = Number(horizon) || 30;

  try {
    await ensureTables();
    const params = [crop, region, h];
    let versionClause = "";
    if (version) {
      versionClause = " AND model_version = ?";
      params.push(version);
    }

    const [rows] = await pool.query(
      `SELECT date, price_pred, lower, upper, model_name, model_version, generated_at
       FROM market_forecasts
       WHERE crop = ? AND region = ? AND horizon = ?${versionClause}
       ORDER BY date ASC`,
      params
    );

    const forecast = rows.length > 0 ? rows : mockForecast(h);

    // Optional: fetch latest metrics
    const [metricRows] = await pool.query(
      `SELECT mape, mae, rmse, computed_at, model_name, model_version
       FROM forecast_metrics
       WHERE crop = ? AND region = ?
       ORDER BY computed_at DESC
       LIMIT 1`,
      [crop, region]
    );

    const metric = metricRows[0] || null;

    res.json({
      success: true,
      horizon: h,
      forecast,
      model: {
        name: rows[0]?.model_name || "prophet-mock",
        version: rows[0]?.model_version || version || "mock-0.1",
        mape: metric?.mape ?? 0.12,
        last_trained_at: metric?.computed_at || now().toISOString(),
      },
      meta: { crop, region, stale: rows.length === 0 }
    });
  } catch (err) {
    console.error("getMarketForecasts error:", err.message);
    res.json({
      success: true,
      horizon: h,
      forecast: mockForecast(h),
      model: { name: "prophet-mock", version: version || "mock-0.1", mape: 0.12, last_trained_at: now().toISOString() },
      meta: { crop, region, stale: true, error: err.message }
    });
  }
};

// GET /market/anomalies
export const getMarketAnomalies = async (req, res) => {
  const { crop = "teff", region = "Addis Ababa", period = 90 } = req.query;
  // Placeholder anomalies; replace with DB/ML output later.
  const anomalies = [
    { date: daysFromNow(-7), price: 48, score: 0.9, reason: "Spike vs seasonal baseline" },
    { date: daysFromNow(-30), price: 34, score: 0.82, reason: "Dip vs moving average" },
  ];

  res.json({
    success: true,
    anomalies,
    meta: { crop, region, period: Number(period) || 90 }
  });
};

// POST /market/backtest (admin-only; placeholder)
export const runMarketBacktest = async (req, res) => {
  const { crop = "teff", region = "Addis Ababa", period = 180 } = req.body || {};
  res.json({
    success: true,
    metrics: { mape: 0.12, mae: 1.8, rmse: 2.3 },
    runs: [
      { start: daysFromNow(-(Number(period) || 180)), end: daysFromNow(-1), mape: 0.12 }
    ],
    model: { name: "prophet-mock", version: "mock-0.1" }
  });
};
