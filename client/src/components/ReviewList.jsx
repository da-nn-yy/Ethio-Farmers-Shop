import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/apiService.js';
import { useAuth } from '../hooks/useAuth.jsx';

const ReviewList = ({ listingId, farmerId, showFarmerReviews = false }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [listingId, farmerId, showFarmerReviews, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };

      let response;
      if (showFarmerReviews && farmerId) {
        response = await reviewService.getFarmerReviews(farmerId, params);
      } else {
        response = await reviewService.getListingReviews(listingId, params);
      }

      if (page === 1) {
        setReviews(response.reviews || []);
      } else {
        setReviews(prev => [...prev, ...(response.reviews || [])]);
      }

      setHasMore(response.hasMore || false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => {
            setError('');
            fetchReviews();
          }}
          className="mt-2 text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">
                  {review.buyer_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">
                  {review.buyer_name || 'Anonymous'}
                </h4>
                <div className="flex items-center space-x-2">
                  <StarRating rating={review.rating} />
                  <span className="text-sm text-gray-500">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delete button for user's own reviews */}
            {user && user.id === review.buyer_user_id && (
              <button
                onClick={() => handleDeleteReview(review.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed">
            {review.comment}
          </p>
        </div>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;

