-- Performance optimization indexes for listings
-- Run this script to add indexes that will significantly improve query performance

-- Indexes for produce_listings table
CREATE INDEX IF NOT EXISTS idx_listings_status_quantity ON produce_listings(status, quantity);
CREATE INDEX IF NOT EXISTS idx_listings_farmer_status ON produce_listings(farmer_user_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON produce_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_region ON produce_listings(region);
CREATE INDEX IF NOT EXISTS idx_listings_crop ON produce_listings(crop);
CREATE INDEX IF NOT EXISTS idx_listings_price ON produce_listings(price_per_unit);

-- Composite index for the main query
CREATE INDEX IF NOT EXISTS idx_listings_active_quantity_created ON produce_listings(status, quantity, created_at DESC);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region);

-- Indexes for listing_images table
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_sort ON listing_images(listing_id, sort_order);

-- Indexes for user_avatars table
CREATE INDEX IF NOT EXISTS idx_user_avatars_user ON user_avatars(user_id);

-- Analyze tables to update statistics
ANALYZE TABLE produce_listings;
ANALYZE TABLE users;
ANALYZE TABLE listing_images;
ANALYZE TABLE user_avatars;
