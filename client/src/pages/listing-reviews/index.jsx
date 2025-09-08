import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService, reviewService } from '../../services/apiService.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import ReviewForm from '../../components/ReviewForm.jsx';
import ReviewList from '../../components/ReviewList.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/AppIcon.jsx';

const ListingReviewsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userCanReview, setUserCanReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
      checkUserCanReview();
    }
  }, [id, user]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await listingService.getListingById(id);
      setListing(response);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const checkUserCanReview = async () => {
    if (!isAuthenticated || !user || user.role !== 'buyer') {
      setUserCanReview(false);
      return;
    }

    try {
      // Check if user has completed orders for this listing
      const response = await reviewService.getUserReviews({
        listingId: id
      });

      // If user has no reviews for this listing, they can review
      const hasReviewed = response.reviews?.some(review => review.listing_id == id);
      setUserCanReview(!hasReviewed);
    } catch (err) {
      console.error('Error checking review eligibility:', err);
      setUserCanReview(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setUserCanReview(false);
    // Refresh the page to show the new review
    window.location.reload();
  };

  const handleBackToListings = () => {
    navigate('/browse-listings-buyer-home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Listing</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={handleBackToListings}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Listings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Listing Not Found</h1>
            <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist.</p>
            <Button onClick={handleBackToListings}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Listings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackToListings}
              className="flex items-center space-x-2"
            >
              <Icon name="ArrowLeft" size={16} />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{listing.title}</h1>
              <p className="text-gray-600">Reviews and Ratings</p>
            </div>
          </div>
        </div>

        {/* Listing Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-4">
            <img
              src={listing.image || '/assets/images/no_image.png'}
              alt={listing.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{listing.title}</h2>
              <p className="text-gray-600 mb-2">{listing.crop} - {listing.variety}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Price: {listing.pricePerUnit} {listing.currency}/kg</span>
                <span>Available: {listing.quantity} {listing.unit}</span>
                <span>Location: {listing.region}, {listing.woreda}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {userCanReview && (
          <div className="mb-6">
            {!showReviewForm ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Write a Review
                </h3>
                <p className="text-gray-600 mb-4">
                  Share your experience with this product to help other buyers.
                </p>
                <Button onClick={() => setShowReviewForm(true)}>
                  Write Review
                </Button>
              </div>
            ) : (
              <ReviewForm
                listingId={id}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Customer Reviews
          </h3>
          <ReviewList listingId={id} />
        </div>
      </div>
    </div>
  );
};

export default ListingReviewsPage;


