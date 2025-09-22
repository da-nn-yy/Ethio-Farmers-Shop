import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'default',
  ...props 
}) => {
  const baseClasses = 'bg-white border border-gray-200 rounded-lg shadow-sm';
  
  const variantClasses = {
    default: 'bg-white border-gray-200',
    elevated: 'bg-white border-gray-200 shadow-md',
    outlined: 'bg-white border-gray-300 shadow-none',
    filled: 'bg-gray-50 border-gray-200',
    primary: 'bg-primary/5 border-primary/20',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    paddingClasses[padding] || paddingClasses.default,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
