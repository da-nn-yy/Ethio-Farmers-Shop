import React from 'react';

const LoadingSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(count)]?.map((_, index) => (
        <div key={index} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
          {/* Image Skeleton */}
          <div className="aspect-[4/3] bg-muted" />
          
          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-5 bg-muted rounded w-3/4" />
            
            {/* Price */}
            <div className="h-6 bg-muted rounded w-1/2" />
            
            {/* Farmer Info */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-muted rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                {[...Array(5)]?.map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-muted rounded" />
                ))}
              </div>
              <div className="h-3 bg-muted rounded w-16" />
            </div>
            
            {/* Availability */}
            <div className="flex justify-between">
              <div className="h-3 bg-muted rounded w-20" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <div className="h-3 bg-muted rounded w-8" />
              <div className="h-8 bg-muted rounded w-20" />
            </div>
            
            {/* Buttons */}
            <div className="flex gap-2">
              <div className="h-8 bg-muted rounded flex-1" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;