import React from 'react';
import { cn } from '../../utils/cn';

const variantToClasses = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-input text-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-black',
  info: 'bg-sky-600 text-white'
};

export function Badge({ variant = 'default', className, children, ...props }) {
  const variantClasses = variantToClasses[variant] || variantToClasses.default;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;





