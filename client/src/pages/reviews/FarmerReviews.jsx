import React, { useEffect, useMemo, useState } from 'react';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/AppIcon.jsx';
import { reviewService } from '../../services/apiService.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import ReviewForm from '../../components/ReviewForm.jsx';

const StarBar = ({ label, count = 0, total = 0 }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center space-x-3">
      <span className="w-16 text-sm text-text-secondary">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-2 bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-sm text-text-secondary">{count}</span>
    </div>
  );
};

const FarmerReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const farmerId = user?.id;

  useEffect(() => {
    if (!farmerId) return;
    fetchReviews(true);
    setCanReview(user?.role === 'buyer');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId, ratingFilter]);

  const fetchReviews = async (reset = false) => {
    try {
      setLoading(true);
      const params = { page: reset ? 1 : page, limit: 10 };
      if (ratingFilter !== 'all') params.rating = ratingFilter;
      const res = await reviewService.getFarmerReviews(farmerId, params);
      const list = res.reviews || [];
      setReviews(reset ? list : [...reviews, ...list]);
      setHasMore(res?.pagination?.hasNext || false);
      if (reset) setPage(1);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const s = {
      avg: Number((reviews.reduce((a, r) => a + (r.rating || 0), 0) / (reviews.length || 1)).toFixed(2)),
      total: reviews.length,
      dist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
    reviews.forEach(r => { s.dist[r.rating] = (s.dist[r.rating] || 0) + 1; });
    return s;
  }, [reviews]);

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Farmer Reviews</h1>
          <div className="flex items-center space-x-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-input text-sm"
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => fetchReviews(true)}>Refresh</Button>
            {canReview && (
              <Button size="sm" iconName="Star" onClick={() => setShowReviewForm(v => !v)}>
                {showReviewForm ? 'Close' : 'Write Review'}
              </Button>
            )}
          </div>
        </div>

        {/* Optional Write Review Form (buyer about farmer) */}
        {canReview && showReviewForm && (
          <div className="mb-6">
            <ReviewForm farmerId={farmerId} onReviewSubmitted={() => { setShowReviewForm(false); fetchReviews(true); }} onCancel={() => setShowReviewForm(false)} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-card border rounded-lg p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Star" size={20} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.avg || 0}</div>
              <div className="text-sm text-text-secondary">Average Rating</div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Icon name="MessageSquare" size={20} className="text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
              <div className="text-sm text-text-secondary">Total Reviews</div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6 space-y-2">
            <StarBar label="5★" count={stats.dist[5]} total={stats.total} />
            <StarBar label="4★" count={stats.dist[4]} total={stats.total} />
            <StarBar label="3★" count={stats.dist[3]} total={stats.total} />
            <StarBar label="2★" count={stats.dist[2]} total={stats.total} />
            <StarBar label="1★" count={stats.dist[1]} total={stats.total} />
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading && reviews.length === 0 && (
            <div className="p-6 text-center text-text-secondary">Loading reviews...</div>
          )}
          {error && (
            <div className="p-4 border border-error/20 bg-error/10 text-error rounded-lg">{error}</div>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-semibold text-text-secondary">{(r.reviewer_name || 'U').charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">{r.reviewer_name || 'Anonymous'}</div>
                    <div className="text-sm text-text-secondary">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(st => (
                    <span key={st} className={`text-lg ${st <= r.rating ? 'text-yellow-400' : 'text-muted-foreground'}`}>★</span>
                  ))}
                </div>
              </div>
              {r.comment && (
                <p className="mt-3 text-text-primary leading-relaxed">{r.comment}</p>
              )}
              {r.listing_title && (
                <div className="mt-2 text-sm text-text-secondary">Listing: {r.listing_title}</div>
              )}
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-2">
              <Button variant="outline" onClick={() => { setPage(p => p + 1); fetchReviews(false); }}>Load More</Button>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default FarmerReviews;



