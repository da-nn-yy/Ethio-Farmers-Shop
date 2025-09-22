import React, { useEffect, useMemo, useState } from 'react';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/AppIcon.jsx';
import { reviewService } from '../../services/apiService.js';

const Star = ({ filled }) => (
  <span className={filled ? 'text-yellow-400' : 'text-muted-foreground'}>★</span>
);

const UserReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadReviews(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReviews = async (reset = false) => {
    try {
      setLoading(true);
      const res = await reviewService.getUserReviews({ page: reset ? 1 : page, limit: 10 });
      const list = res.reviews || [];
      setReviews(reset ? list : [...reviews, ...list]);
      setHasMore(res?.pagination?.hasNext || false);
      if (reset) setPage(1);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load your reviews');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const count = reviews.length;
    const avg = Number((reviews.reduce((a, r) => a + (r.rating || 0), 0) / (count || 1)).toFixed(2));
    return { count, avg };
  }, [reviews]);

  return (
    <AuthenticatedLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Reviews</h1>
            <p className="text-text-secondary">Reviews you have written for farmers and listings.</p>
          </div>
          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => loadReviews(true)}>Refresh</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-card border rounded-lg p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Star" size={20} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.avg}</div>
              <div className="text-sm text-text-secondary">Average Rating</div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Icon name="MessageSquare" size={20} className="text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.count}</div>
              <div className="text-sm text-text-secondary">Total Reviews</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading && reviews.length === 0 && (
            <div className="p-6 text-center text-text-secondary">Loading your reviews…</div>
          )}
          {error && (
            <div className="p-4 border border-error/20 bg-error/10 text-error rounded-lg">{error}</div>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-semibold text-text-secondary">{(r.listing_title || 'L').charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">{r.listing_title || 'Listing'}</div>
                    <div className="text-sm text-text-secondary">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(st => (
                    <Star key={st} filled={st <= r.rating} />
                  ))}
                </div>
              </div>
              {r.comment && (
                <p className="mt-3 text-text-primary leading-relaxed">{r.comment}</p>
              )}
              {r.farmer_name && (
                <div className="mt-2 text-sm text-text-secondary">Farmer: {r.farmer_name}</div>
              )}
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-2">
              <Button variant="outline" onClick={() => { setPage(p => p + 1); loadReviews(false); }}>Load More</Button>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default UserReviewsPage;


