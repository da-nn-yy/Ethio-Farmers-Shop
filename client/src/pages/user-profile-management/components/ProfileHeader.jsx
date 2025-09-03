import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ userRole, currentLanguage, onEditPhoto, user }) => {
  const [isEditing, setIsEditing] = useState(false);

  const displayName = user?.fullName || (currentLanguage === 'am' ? 'ያልተሰየመ' : 'Unnamed User');
  const displayLocation = user?.region && user?.woreda ? `${user.woreda}, ${user.region}` : (currentLanguage === 'am' ? 'አካባቢ የለም' : 'No location');
  const avatar = user?.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName);

  const getVerificationBadge = () => {
    const isVerified = user?.verificationStatus === 'verified';
    return (
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
        isVerified
          ? 'bg-success/10 text-success border border-success/20' :'bg-warning/10 text-warning border border-warning/20'
      }`}>
        <Icon
          name={isVerified ? "CheckCircle" : "Clock"}
          size={12}
        />
        <span>
          {currentLanguage === 'am'
            ? (isVerified ? 'የተረጋገጠ' : 'በመጠባበቅ ላይ')
            : (isVerified ? 'Verified' : 'Pending')
          }
        </span>
      </div>
    );
  };

  const getRoleBadge = () => {
    const roleColors = {
      farmer: 'bg-primary/10 text-primary border-primary/20',
      buyer: 'bg-secondary/10 text-secondary border-secondary/20'
    };

    return (
      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${roleColors?.[userRole]}`}>
        {currentLanguage === 'am'
          ? (userRole === 'farmer' ? 'ገበሬ' : 'ገዢ')
          : (userRole === 'farmer' ? 'Farmer' : 'Buyer')
        }
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
              <Image src={avatar} alt={displayName} className="w-full h-full object-cover" />
            </div>
            <label
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-surface border border-border rounded-full shadow-warm"
            >
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onEditPhoto && onEditPhoto(e.target.files?.[0])} />
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="Camera" size={14} />
              </div>
            </label>
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-text-primary">{displayName}</h1>
            <div className="flex items-center justify-center space-x-2">
              {getRoleBadge()}
              {getVerificationBadge()}
            </div>
            <div className="flex items-center justify-center space-x-1 text-text-secondary">
              <Icon name="MapPin" size={14} />
              <span className="text-sm">{displayLocation}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Icon name="Star" size={16} className="text-accent fill-current" />
                <span className="font-bold text-text-primary">{user?.rating}</span>
              </div>
              <span className="text-xs text-text-secondary">
                {currentLanguage === 'am' ? 'ደረጃ' : 'Rating'}
              </span>
            </div>
            <div className="text-center">
              <div className="font-bold text-text-primary mb-1">{user?.completionRate}%</div>
              <span className="text-xs text-text-secondary">
                {currentLanguage === 'am' ? 'ማጠናቀቅ' : 'Completion'}
              </span>
            </div>
            <div className="text-center">
              <div className="font-bold text-text-primary mb-1">{user?.totalOrders}</div>
              <span className="text-xs text-text-secondary">
                {currentLanguage === 'am' ? 'ትዕዛዞች' : 'Orders'}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex items-start space-x-6">
          {/* Profile Photo */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
              <Image src={avatar} alt={displayName} className="w-full h-full object-cover" />
            </div>
            <label
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-surface border border-border rounded-full shadow-warm"
            >
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onEditPhoto && onEditPhoto(e.target.files?.[0])} />
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="Camera" size={16} />
              </div>
            </label>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-text-primary">{displayName}</h1>
                {getRoleBadge()}
                {getVerificationBadge()}
              </div>

              <div className="flex items-center space-x-4 text-text-secondary">
                <div className="flex items-center space-x-1">
                  <Icon name="MapPin" size={16} />
                  <span>{displayLocation}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={16} />
                  <span>
                    {currentLanguage === 'am' ? 'ተቀላቀለ ' : 'Joined '}
                    {/* Placeholder joined date */}
                    2024
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Icon name="Star" size={18} className="text-accent fill-current" />
                  <span className="text-xl font-bold text-text-primary">{user?.rating}</span>
                </div>
                <span className="text-sm text-text-secondary">
                  {currentLanguage === 'am' ? 'አማካይ ደረጃ' : 'Average Rating'}
                </span>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-xl font-bold text-text-primary mb-2">{user?.completionRate}%</div>
                <span className="text-sm text-text-secondary">
                  {currentLanguage === 'am' ? 'ማጠናቀቅ ደረጃ' : 'Completion Rate'}
                </span>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-xl font-bold text-text-primary mb-2">
                  {currentLanguage === 'am' ? user?.responseTimeAm : user?.responseTime}
                </div>
                <span className="text-sm text-text-secondary">
                  {currentLanguage === 'am' ? 'ምላሽ ጊዜ' : 'Response Time'}
                </span>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-xl font-bold text-text-primary mb-2">{user?.totalOrders}</div>
                <span className="text-sm text-text-secondary">
                  {currentLanguage === 'am' ? 'ጠቅላላ ትዕዛዞች' : 'Total Orders'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
