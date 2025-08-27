import React from 'react';

const NotificationBadge = ({ 
  count = 0, 
  maxCount = 99, 
  size = 'default',
  variant = 'default',
  className = '',
  showZero = false 
}) => {
  // Don't render if count is 0 and showZero is false
  if (count === 0 && !showZero) {
    return null;
  }

  // Size configurations
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    default: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  // Variant configurations
  const variantClasses = {
    default: 'bg-accent text-accent-foreground',
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    error: 'bg-error text-error-foreground',
    secondary: 'bg-secondary text-secondary-foreground'
  };

  // Format count display
  const displayCount = count > maxCount ? `${maxCount}+` : count?.toString();

  return (
    <span 
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full
        ${sizeClasses?.[size]}
        ${variantClasses?.[variant]}
        ${className}
      `}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;