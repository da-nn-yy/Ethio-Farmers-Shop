# Market Forecast API and Service Boundary

## Goals
- Provide market trends, forecasts, and anomalies per crop/region.
- Keep a stable contract the frontend can rely on.
- Allow swapping the underlying ML (Prophet/ARIMA, TFT/LSTM, or external API) without changing clients.

## Endpoints (server-facing contract)
- GET /market/trends
  - Params: crop, region, period (days, default 180)
  - Returns historical series: [{ date, price, volume }]
- GET /market/forecasts
  - Params: crop, region, horizon (7|30|90), version (optional model version)
  - Returns forecast series: [{ date, price_pred, lower, upper }], model info, meta
- GET /market/anomalies
  - Params: crop, region, period (default 90)
  - Returns anomalies: [{ date, price, score, reason }]
- POST /market/backtest (admin only)
  - Body: { crop, region, period }
  - Returns metrics (mape, mae, rmse) and run details

## Response shape (example: /market/forecasts)
{
  "success": true,
  "horizon": 30,
  "forecast": [
    { "date": "2026-02-01", "price_pred": 42.1, "lower": 38.0, "upper": 46.5 },
    { "date": "2026-02-02", "price_pred": 42.3, "lower": 38.1, "upper": 46.7 }
  ],
  "model": { "name": "prophet", "version": "2026-01-23.01", "mape": 0.12, "last_trained_at": "2026-01-23T06:00:00Z" },
  "meta": { "crop": "teff", "region": "Addis Ababa" }
}

## Data model (DB tables)
- market_series: crop, region, date, price, volume, source, ingested_at
- market_features: crop, region, date, features_json (seasonality, weather, momentum)
- market_forecasts: crop, region, horizon, date, price_pred, lower, upper, model_name, model_version, generated_at
- forecast_metrics: crop, region, model_name, model_version, period, mape, mae, rmse, computed_at
- external_feeds: provider, endpoint, status, last_success_at, error_msg

Indexes: (crop, region, date) on series/features/forecasts; (crop, region, horizon, date) on forecasts.

## Inference & caching
- Batch forecasts daily for 7/30/90 horizons; store in market_forecasts.
- Serve GET /market/forecasts from DB/Redis cache; mark stale if older than 24h.
- Fallback: if missing/stale, run a quick baseline (Prophet) and return.

## Training pipeline (daily)
- ETL: aggregate internal price/volume per crop-region; join external feeds; sanitize outliers; normalize units.
- Features: seasonality (dow/week/month), holidays, weather lags, price momentum, seller density.
- Models: start with Prophet/ARIMA; graduate to TFT/LSTM when data volume and uplift justify.
- Backtesting: rolling-origin; store forecast_metrics; auto-promote best version per crop-region.

## Client integration (MarketTrends widget)
- Fetch /market/trends for historical sparkline.
- Fetch /market/forecasts?horizon=30 to overlay forecast + confidence band.
- Show model version, MAPE, and stale flag in tooltips.
- Alerts if forecasted change exceeds threshold or anomalies detected.

## Ops & monitoring
- Jobs: nightly ETL + training; morning forecast publish.
- Monitors: job success, data freshness, API latency, error rates, drift checks; dashboards for MAPE/MAE.
- Logging: forecast requests and served model versions; backtest results.
- Security: rate-limit public endpoints; admin-only backtests; no PII.

## Rollout plan
- Phase 1 (MVP): Prophet baseline, daily batch forecasts, UI wired to cached endpoints.
- Phase 2: Multivariate features + anomalies; add alerts; introduce TFT/LSTM where it helps.
- Phase 3: Explainability surfaced in UI; optimization suggestions (timing/region targeting).
