import React, { useState, useEffect } from 'react';
import { favoriteService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';

const FavoriteButton = ({ listingId, className = "" }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && listingId) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, listingId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteService.checkFavoriteStatus(listingId);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFromFavorites(listingId);
        setIsFavorite(false);
      } else {
        await favoriteService.addToFavorites(listingId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      alert('Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`favorite-btn ${className} ${isFavorite ? 'favorited' : ''}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <span className="animate-spin">⟳</span>
      ) : (
        <span className="text-xl">{isFavorite ? '❤️' : '🤍'}</span>
      )}
    </button>
  );
};

export default FavoriteButton;
