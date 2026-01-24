import { pool } from "../config/database.js";

// Placeholder utilities to mock data; replace with real DB/ML service.
const now = () => new Date();
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const BASELINE_MODEL = "baseline-linear";
const BASELINE_VERSION = "baseline-latest";

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
    INDEX idx_fm_crop_region (crop, region),
    UNIQUE KEY uniq_metric (crop, region, model_name, model_version, period)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const getLastPrice = async (crop, region) => {
  const [rows] = await pool.query(
    `SELECT price FROM market_series WHERE crop = ? AND region = ? ORDER BY date DESC LIMIT 1`,
    [crop, region]
  );
  return rows[0]?.price ?? null;
};

const buildBaselineForecast = async ({ crop, region, horizon }) => {
  const lastPrice = await getLastPrice(crop, region);
  if (lastPrice == null) {
    return { rows: mockForecast(horizon), modelName: "prophet-mock", modelVersion: "mock-0.1", source: "mock" };
  }

  const rows = Array.from({ length: horizon }).map((_, i) => {
    const step = i + 1;
    const drift = (horizon === 90 ? 0.12 : horizon === 30 ? 0.08 : 0.03) * (step / horizon);
    const price_pred = Number(lastPrice) * (1 + drift);
    return {
      date: daysFromNow(step),
      price_pred,
      lower: price_pred * 0.95,
      upper: price_pred * 1.05,
      model_name: BASELINE_MODEL,
      model_version: BASELINE_VERSION,
    };
  });

  return { rows, modelName: BASELINE_MODEL, modelVersion: BASELINE_VERSION, source: "baseline" };
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
    let effectiveVersion = version;
    if (!effectiveVersion) {
      const [latest] = await pool.query(
        `SELECT model_version
         FROM market_forecasts
         WHERE crop = ? AND region = ? AND horizon = ?
         ORDER BY generated_at DESC
         LIMIT 1`,
        [crop, region, h]
      );
      effectiveVersion = latest[0]?.model_version;
    }

    const params = effectiveVersion ? [crop, region, h, effectiveVersion] : [crop, region, h];
    const [rows] = await pool.query(
      `SELECT date, price_pred, lower, upper, model_name, model_version, generated_at
       FROM market_forecasts
       WHERE crop = ? AND region = ? AND horizon = ?${effectiveVersion ? " AND model_version = ?" : ""}
       ORDER BY date ASC`,
      params
    );

    let forecast = rows.map((r) => ({
      date: r.date,
      price_pred: Number(r.price_pred),
      lower: r.lower != null ? Number(r.lower) : null,
      upper: r.upper != null ? Number(r.upper) : null,
      model_name: r.model_name,
      model_version: r.model_version,
      generated_at: r.generated_at,
    }));
    let source = rows.length > 0 ? "db" : "mock";
    let modelName = rows[0]?.model_name || "prophet-mock";
    let modelVersion = rows[0]?.model_version || effectiveVersion || "mock-0.1";

    if (rows.length === 0) {
      const baseline = await buildBaselineForecast({ crop, region, horizon: h });
      forecast = baseline.rows;
      source = baseline.source;
      modelName = baseline.modelName;
      modelVersion = baseline.modelVersion;
    }

    // Optional: fetch latest metrics
    const [metricRows] = await pool.query(
      `SELECT mape, mae, rmse, computed_at, model_name, model_version
       FROM forecast_metrics
       WHERE crop = ? AND region = ?
        AND model_name = ? AND model_version = ?
       ORDER BY computed_at DESC
       LIMIT 1`,
      [crop, region, modelName, modelVersion]
    );

    const metric = metricRows[0] || null;

    res.json({
      success: true,
      horizon: h,
      forecast,
      model: {
        name: modelName,
        version: modelVersion,
        mape: metric?.mape ?? 0.12,
        last_trained_at: metric?.computed_at || now().toISOString(),
      },
      meta: { crop, region, stale: rows.length === 0, source }
    });
  } catch (err) {
    console.error("getMarketForecasts error:", err.message);
    res.json({
      success: true,
      horizon: h,
      forecast: mockForecast(h),
      model: { name: "prophet-mock", version: version || "mock-0.1", mape: 0.12, last_trained_at: now().toISOString() },
      meta: { crop, region, stale: true, error: err.message, source: "mock" }
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
