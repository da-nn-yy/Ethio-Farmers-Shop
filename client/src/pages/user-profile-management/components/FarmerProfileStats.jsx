import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import Icon from '../../../components/AppIcon';

const FarmerProfileStats = ({ currentLanguage }) => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
          
          const { data } = await axios.get(`${API_BASE}/farmer-profile/profile/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setStats(data.stats);
          setRecentActivity(data.recent_activity);
        }
      } catch (error) {
        console.error('Failed to load farmer stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const getLabel = (text, textAm) => {
    return currentLanguage === 'am' ? textAm : text;
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-error';
  };

  const getCompletionBg = (percentage) => {
    if (percentage >= 80) return 'bg-success/10';
    if (percentage >= 60) return 'bg-warning/10';
    return 'bg-error/10';
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <div className="text-center text-text-secondary">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted" />
          <p>{getLabel('Unable to load profile statistics', 'የመገለጫ ስታቲስቲክስ ማግኘት አልተቻለም')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            {getLabel('Profile Completion', 'የመገለጫ ማጠናቀቅ')}
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionBg(stats.profile_completion)} ${getCompletionColor(stats.profile_completion)}`}>
            {stats.profile_completion}%
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              stats.profile_completion >= 80 ? 'bg-success' : 
              stats.profile_completion >= 60 ? 'bg-warning' : 'bg-error'
            }`}
            style={{ width: `${stats.profile_completion}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-text-secondary">
          {getLabel(
            'Complete your profile to increase visibility and build trust with buyers.',
            'የመገለጫዎን ያጠናቅቁ እና ከገዢዎች ጋር የመተማመን ግንኙነት ይገንቡ።'
          )}
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Package" size={24} className="text-primary" />
            <span className="text-2xl font-bold text-text-primary">{stats.total_listings}</span>
          </div>
          <p className="text-sm text-text-secondary">
            {getLabel('Total Listings', 'ጠቅላላ ዝርዝሮች')}
          </p>
          <p className="text-xs text-success mt-1">
            {stats.active_listings} {getLabel('active', 'ንቁ')}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
          <div className="flex items-center justify-between mb-2">
            <Icon name="ShoppingCart" size={24} className="text-secondary" />
            <span className="text-2xl font-bold text-text-primary">{stats.total_orders}</span>
          </div>
          <p className="text-sm text-text-secondary">
            {getLabel('Total Orders', 'ጠቅላላ ትዕዛዞች')}
          </p>
          <p className="text-xs text-success mt-1">
            {stats.completed_orders} {getLabel('completed', 'ተጠናቋል')}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
          <div className="flex items-center justify-between mb-2">
            <Icon name="DollarSign" size={24} className="text-accent" />
            <span className="text-2xl font-bold text-text-primary">
              {stats.total_earnings ? `ETB ${stats.total_earnings.toLocaleString()}` : 'ETB 0'}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {getLabel('Total Earnings', 'ጠቅላላ ገቢ')}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {getLabel('Avg:', 'አማካይ:')} ETB {stats.avg_order_value?.toFixed(0) || '0'}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Star" size={24} className="text-warning" />
            <span className="text-2xl font-bold text-text-primary">
              {stats.avg_rating ? stats.avg_rating.toFixed(1) : '0.0'}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {getLabel('Average Rating', 'አማካይ ደረጃ')}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {stats.review_count} {getLabel('reviews', 'ግምገማዎች')}
          </p>
        </div>
      </div>

      {/* Farm Details Summary */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Farm Summary', 'የእርሻ ማጠቃለያ')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Icon name="Calendar" size={20} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {stats.experience_years} {getLabel('Years Experience', 'ዓመታት ልምድ')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon name="MapPin" size={20} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {stats.farm_size_ha} {stats.farm_size_unit}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon name="Shield" size={20} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {stats.organic_certified ? getLabel('Organic Certified', 'ኦርጋኒክ የተረጋገጠ') : getLabel('Not Certified', 'ያልተረጋገጠ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {getLabel('Recent Activity', 'የቅርብ እንቅስቃሴ')}
          </h3>
          
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Icon 
                  name={activity.type === 'listing' ? 'Package' : 'ShoppingCart'} 
                  size={16} 
                  className={activity.type === 'listing' ? 'text-primary' : 'text-secondary'} 
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(activity.created_at).toLocaleDateString()} - 
                    <span className={`ml-1 ${
                      activity.status === 'active' ? 'text-success' :
                      activity.status === 'completed' ? 'text-success' :
                      activity.status === 'pending' ? 'text-warning' :
                      'text-text-secondary'
                    }`}>
                      {activity.status}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Achievements', 'የተገኙ ስኬቶች')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.total_listings >= 10 && (
            <div className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg">
              <Icon name="Award" size={20} className="text-success" />
              <div>
                <p className="text-sm font-medium text-success">
                  {getLabel('Active Seller', 'ንቁ ሻጭ')}
                </p>
                <p className="text-xs text-text-secondary">
                  {getLabel('10+ listings created', '10+ ዝርዝሮች ተፈጥረዋል')}
                </p>
              </div>
            </div>
          )}
          
          {stats.completed_orders >= 5 && (
            <div className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg">
              <Icon name="CheckCircle" size={20} className="text-success" />
              <div>
                <p className="text-sm font-medium text-success">
                  {getLabel('Reliable Farmer', 'ታማኝ ገበሬ')}
                </p>
                <p className="text-xs text-text-secondary">
                  {getLabel('5+ orders completed', '5+ ትዕዛዞች ተጠናቋል')}
                </p>
              </div>
            </div>
          )}
          
          {stats.avg_rating >= 4.5 && (
            <div className="flex items-center space-x-3 p-3 bg-warning/10 rounded-lg">
              <Icon name="Star" size={20} className="text-warning" />
              <div>
                <p className="text-sm font-medium text-warning">
                  {getLabel('Top Rated', 'ከፍተኛ ደረጃ')}
                </p>
                <p className="text-xs text-text-secondary">
                  {getLabel('4.5+ average rating', '4.5+ አማካይ ደረጃ')}
                </p>
              </div>
            </div>
          )}
          
          {stats.organic_certified && (
            <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg">
              <Icon name="Leaf" size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">
                  {getLabel('Organic Certified', 'ኦርጋኒክ የተረጋገጠ')}
                </p>
                <p className="text-xs text-text-secondary">
                  {getLabel('Environmentally conscious', 'ለአካባቢ ንቃት')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerProfileStats;
