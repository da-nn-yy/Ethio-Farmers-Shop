
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../../components/ui/Button';
import { marketForecastService } from '../../../services/apiService';


const MarketTrendsWidget = ({ currentLanguage = 'en' }) => {
  const navigate = useNavigate();

  const handleFullReportClick = () => {
    navigate('/buyer/market-trends');
  };

  const [crop] = useState('teff');
  const [region] = useState('Addis Ababa');
  const [period] = useState(30);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await marketForecastService.getTrends({ crop, region, period });
        if (!cancelled) setSeries(res?.series || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load market trends');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [crop, region, period]);

  const chartData = useMemo(() => {
    const last30 = series.slice(Math.max(series.length - 30, 0));
    return last30.map(r => ({ date: r.date, price: typeof r.price === 'string' ? parseFloat(r.price) : r.price }));
  }, [series]);

  const lastPrice = chartData.length ? chartData[chartData.length - 1].price : null;
  const prevPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : null;
  const changePct = (lastPrice != null && prevPrice != null) ? (((lastPrice - prevPrice) / prevPrice) * 100).toFixed(2) : null;

  const formatTooltipLabel = (label) => {
    const date = new Date(label);
    return date?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-warm">
          <p className="text-sm font-medium text-text-primary mb-2">
            {formatTooltipLabel(label)}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-text-secondary">
                {entry.dataKey}: {entry.value} ETB
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 lg:p-6 shadow-warm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="TrendingUp" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {currentLanguage === 'am' ? 'የገበያ አዝማሚያዎች' : 'Market Trends'}
            </h3>
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' ? 'የቅርብ ጊዜ ዋጋዎች' : `Recent ${crop} price in ${region}`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="ExternalLink"
          onClick={handleFullReportClick}
        >
          {currentLanguage === 'am' ? 'ሙሉ ዘገባ' : 'Full Report'}
        </Button>
      </div>
      {/* Status */}
      {loading && (
        <div className="text-sm text-text-secondary mb-2">Loading market trends…</div>
      )}
      {error && (
        <div className="text-sm text-error mb-2">{error}</div>
      )}

      {/* Price Chart */}
      <div className="h-48 lg:h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatTooltipLabel}
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickFormatter={(value) => `${value} ETB`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2D5A27"
              strokeWidth={2}
              dot={{ fill: '#2D5A27', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#2D5A27', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Price Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2D5A27' }} />
            <span className="text-sm font-medium text-text-primary">{crop}</span>
          </div>
          <p className="text-lg font-bold text-text-primary">{lastPrice != null ? `${lastPrice.toFixed(2)} ETB` : '—'}</p>
          <div className="flex items-center justify-center space-x-1">
            <Icon
              name={changePct != null && Number(changePct) >= 0 ? 'TrendingUp' : 'TrendingDown'}
              size={14}
              className={changePct != null && Number(changePct) >= 0 ? 'text-success' : 'text-error'}
            />
            <span className={`text-xs font-medium ${changePct != null && Number(changePct) >= 0 ? 'text-success' : 'text-error'}`}>
              {changePct != null ? `${changePct}%` : '—'}
            </span>
          </div>
        </div>
        <div className="text-center">
          <span className="text-sm font-medium text-text-secondary">Region</span>
          <p className="text-lg font-bold text-text-primary">{region}</p>
        </div>
      </div>
    </div>
  );
};

export default MarketTrendsWidget;
