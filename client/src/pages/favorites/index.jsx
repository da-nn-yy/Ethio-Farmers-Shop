import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { favoriteService } from '../../services/apiService';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await favoriteService.getFavoriteListings({ limit: 50 });
        setFavorites(res.favorites || []);
      } catch (e) {
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">My Favorites</h1>
          <Button variant="primary" onClick={() => navigate('/browse-listings-buyer-home')} iconName="Search" iconPosition="left">
            Browse Listings
          </Button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-text-secondary">Loading...</div>
        ) : error ? (
          <div className="p-4 border rounded-lg bg-error/10 border-error/20 text-error">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-4 text-text-secondary">No favorites yet.</p>
            <Button onClick={() => navigate('/browse-listings-buyer-home')}>Find Listings</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((f) => (
              <div key={f.favorite_id || f.id} className="overflow-hidden border rounded-lg bg-card border-border">
                <img
                  src={f.image || f.images?.[0]?.url || '/public/assets/images/no_image.png'}
                  alt={f.title || f.name || f.crop}
                  className="object-cover w-full h-40"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-text-primary">{f.title || f.name || f.crop}</h3>
                  <p className="text-sm text-text-secondary">{f.crop || f.category} • {f.region}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-medium text-primary">ETB {f.price_per_unit || f.pricePerKg}</span>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate('/listing-reviews') } iconName="Heart" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default FavoritesPage;





























