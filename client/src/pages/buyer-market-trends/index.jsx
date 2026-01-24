import React, { useEffect, useMemo, useState } from 'react';
import { marketForecastService } from '../../services/apiService';

const crops = ['teff', 'wheat', 'maize'];
const regions = ['Addis Ababa', 'Oromia', 'Amhara'];
const horizons = [7, 30, 90];

function formatNumber(n, digits = 2) {
  if (n == null) return '-';
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return Number(num).toFixed(digits);
}

const BuyerMarketTrends = () => {
  const [crop, setCrop] = useState('teff');
  const [region, setRegion] = useState('Addis Ababa');
  const [horizon, setHorizon] = useState(30);
  const [period, setPeriod] = useState(180);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trends, setTrends] = useState({ series: [], meta: {} });
  const [forecasts, setForecasts] = useState({ forecast: [], model: {}, meta: {} });

  const lastObservedPrice = useMemo(() => {
    const s = trends.series;
    if (!s || s.length === 0) return null;
    const last = s[s.length - 1];
    return last?.price ?? null;
  }, [trends]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [trendRes, forecastRes] = await Promise.all([
          marketForecastService.getTrends({ crop, region, period }),
          marketForecastService.getForecasts({ crop, region, horizon })
        ]);
        if (!cancelled) {
          setTrends({ series: trendRes.series || [], meta: trendRes.meta || {} });
          setForecasts({ forecast: forecastRes.forecast || [], model: forecastRes.model || {}, meta: forecastRes.meta || {} });
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load market data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [crop, region, horizon, period]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold">Buyer Market Trends</h1>
        <p className="text-text-secondary mt-2">Explore recent price trends and near-term forecasts.</p>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Crop</label>
            <select value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full border rounded px-3 py-2">
              {crops.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Region</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full border rounded px-3 py-2">
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Horizon</label>
            <select value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="w-full border rounded px-3 py-2">
              {horizons.map((h) => <option key={h} value={h}>{h} days</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Period</label>
            <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className="w-full border rounded px-3 py-2">
              {[90, 180, 365].map((p) => <option key={p} value={p}>{p} days</option>)}
            </select>
          </div>
        </div>

        {/* Status */}
        {loading && (
          <div className="mt-4 text-sm text-text-secondary">Loading data…</div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-600">{error}</div>
        )}

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded p-4">
            <div className="text-sm text-text-secondary">Last Observed Price</div>
            <div className="text-2xl font-semibold mt-1">ETB {formatNumber(lastObservedPrice)}</div>
            <div className="text-xs text-text-secondary mt-2">Source: {trends.meta?.source || 'n/a'}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-text-secondary">Forecast Model</div>
            <div className="text-lg font-semibold mt-1">{forecasts.model?.name || '—'} ({forecasts.model?.version || '—'})</div>
            <div className="text-xs text-text-secondary mt-2">MAPE: {formatNumber(forecasts.model?.mape, 2)}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-text-secondary">Data Source</div>
            <div className="text-lg font-semibold mt-1">{forecasts.meta?.source || '—'}</div>
            <div className="text-xs text-text-secondary mt-2">Stale: {forecasts.meta?.stale ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Trends Table */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Recent Price Trends</h2>
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Price (ETB)</th>
                  <th className="px-3 py-2 text-left">Volume</th>
                </tr>
              </thead>
              <tbody>
                {trends.series.slice(Math.max(trends.series.length - 30, 0)).map((row, i) => (
                  <tr key={`${row.date}-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{formatNumber(row.price)}</td>
                    <td className="px-3 py-2">{formatNumber(row.volume)}</td>
                  </tr>
                ))}
                {trends.series.length === 0 && (
                  <tr><td className="px-3 py-2" colSpan={3}>No trend data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Forecast Table */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Forecast ({horizon} days)</h2>
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Predicted (ETB)</th>
                  <th className="px-3 py-2 text-left">Lower</th>
                  <th className="px-3 py-2 text-left">Upper</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.forecast.map((row, i) => (
                  <tr key={`${row.date}-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{formatNumber(row.price_pred)}</td>
                    <td className="px-3 py-2">{formatNumber(row.lower)}</td>
                    <td className="px-3 py-2">{formatNumber(row.upper)}</td>
                  </tr>
                ))}
                {forecasts.forecast.length === 0 && (
                  <tr><td className="px-3 py-2" colSpan={4}>No forecast data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerMarketTrends;
