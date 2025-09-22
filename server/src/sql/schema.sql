-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ethio_farmers_market;

-- Use the database
USE ethio_farmers_market;

-- Users (auth source: Firebase; single row per person)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  role ENUM('admin','farmer','buyer') NOT NULL,
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  full_name VARCHAR(255) NULL,
  phone VARCHAR(64) NULL,
  email VARCHAR(255) NULL,
  region VARCHAR(128) NULL,
  woreda VARCHAR(128) NULL,
  avg_rating DECIMAL(3,2) NULL,
  review_count INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Farmer-specific profile
CREATE TABLE IF NOT EXISTS farmer_profiles (
  user_id BIGINT NOT NULL PRIMARY KEY,
  farm_name VARCHAR(255) NULL,
  farm_size_ha DECIMAL(10,2) NULL,
  farm_size_unit ENUM('hectares', 'acres', 'square-meters') DEFAULT 'hectares',
  certifications JSON NULL,
  crops JSON NULL,
  experience_years INT NULL,
  address TEXT NULL,
  farming_methods JSON NULL,
  seasonal_availability ENUM('year-round', 'seasonal', 'harvest-only') DEFAULT 'year-round',
  business_hours_start TIME NULL,
  business_hours_end TIME NULL,
  farm_description TEXT NULL,
  farm_description_am TEXT NULL,
  specializations JSON NULL,
  equipment JSON NULL,
  irrigation_type ENUM('rain-fed', 'irrigated', 'mixed') NULL,
  soil_type ENUM('clay', 'sandy', 'loamy', 'rocky', 'mixed') NULL,
  organic_certified BOOLEAN DEFAULT FALSE,
  fair_trade_certified BOOLEAN DEFAULT FALSE,
  gmo_free BOOLEAN DEFAULT TRUE,
  sustainability_practices JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_farmer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admins table (sub-roles and permissions)
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  role ENUM('superadmin','manager','moderator') NOT NULL DEFAULT 'manager',
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  permissions JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_user (user_id),
  CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Buyer-specific profile
CREATE TABLE IF NOT EXISTS buyer_profiles (
  user_id BIGINT NOT NULL PRIMARY KEY,
  company_name VARCHAR(255) NULL,
  business_type ENUM('retailer','wholesaler','restaurant','individual','other') NULL,
  preferred_crops JSON NULL,
  address TEXT NULL,
  CONSTRAINT fk_buyer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Listings posted by farmers
CREATE TABLE IF NOT EXISTS produce_listings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  crop VARCHAR(128) NOT NULL,
  variety VARCHAR(128) NULL,
  quantity NUMERIC(12,2) NOT NULL,
  unit ENUM('kg','ton','crate','bag','unit') NOT NULL DEFAULT 'kg',
  price_per_unit NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'ETB',
  available_from DATE NULL,
  available_until DATE NULL,
  region VARCHAR(128) NULL,
  woreda VARCHAR(128) NULL,
  description TEXT NULL,
  status ENUM('active','paused','sold','expired','draft','inactive','sold_out','low_stock') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_listings_farmer (farmer_user_id),
  INDEX idx_listings_crop (crop),
  INDEX idx_listings_status (status),
  CONSTRAINT fk_listing_farmer FOREIGN KEY (farmer_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Listing images
CREATE TABLE IF NOT EXISTS listing_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT NOT NULL,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_image_listing FOREIGN KEY (listing_id) REFERENCES produce_listings(id) ON DELETE CASCADE,
  INDEX idx_images_listing (listing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders (buyer purchases from farmer)
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  buyer_user_id BIGINT NOT NULL,
  farmer_user_id BIGINT NOT NULL,
  status ENUM('pending','confirmed','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) GENERATED ALWAYS AS (subtotal + delivery_fee) STORED,
  currency CHAR(3) NOT NULL DEFAULT 'ETB',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_buyer (buyer_user_id),
  INDEX idx_orders_farmer (farmer_user_id),
  INDEX idx_orders_status (status),
  CONSTRAINT fk_order_buyer FOREIGN KEY (buyer_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_order_farmer FOREIGN KEY (farmer_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Order items (each from a listing snapshot)
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  listing_id INT NOT NULL,
  crop VARCHAR(128) NOT NULL,
  unit ENUM('kg','ton','crate','bag','unit') NOT NULL,
  price_per_unit NUMERIC(12,2) NOT NULL,
  quantity NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) GENERATED ALWAYS AS (price_per_unit * quantity) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_items_order (order_id),
  CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_listing FOREIGN KEY (listing_id) REFERENCES produce_listings(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reviews (buyers review listings)
CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reviewer_user_id BIGINT NOT NULL,
  listing_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_user FOREIGN KEY (reviewer_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_listing FOREIGN KEY (listing_id) REFERENCES produce_listings(id) ON DELETE CASCADE,
  INDEX idx_reviews_listing (listing_id),
  INDEX idx_reviews_reviewer (reviewer_user_id),
  INDEX idx_reviews_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Manual bootstrap (optional): First Admin user
-- NOTE: Create the database 'ethio_farmers_market' in XAMPP/phpMyAdmin first,
--       then run this file. To create the first admin account, you can
--       execute the following statements manually (uncomment and adjust):
--
-- INSERT INTO users (firebase_uid, email, full_name, phone, role, status)
-- VALUES (UUID(), 'first.admin@example.com', 'First Admin', '+251900000000', 'admin', 'active');
-- SET @admin_user_id = LAST_INSERT_ID();
-- INSERT INTO admins (user_id, role, status)
-- VALUES (@admin_user_id, 'superadmin', 'active')
-- ON DUPLICATE KEY UPDATE role = VALUES(role), status = VALUES(status);
-- =============================================

-- Addresses (optional, can relate to buyer delivery or farmer pickup)
CREATE TABLE IF NOT EXISTS addresses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  label VARCHAR(64) NULL,
  region VARCHAR(128) NULL,
  woreda VARCHAR(128) NULL,
  details TEXT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_addresses_user (user_id),
  CONSTRAINT fk_addr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Favorites (buyers can favorite listings)
CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  buyer_user_id BIGINT NOT NULL,
  listing_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav_buyer_listing (buyer_user_id, listing_id),
  CONSTRAINT fk_fav_buyer FOREIGN KEY (buyer_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_listing FOREIGN KEY (listing_id) REFERENCES produce_listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications (simple)
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(64) NOT NULL,
  payload JSON NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user (user_id),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Direct messages between users (buyer-farmer chat)
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sender_id BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_user_pair (sender_id, receiver_id, created_at),
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User avatars (referenced in queries but missing from schema)
CREATE TABLE IF NOT EXISTS user_avatars (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_avatar (user_id),
  CONSTRAINT fk_avatar_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reset_token (token),
  INDEX idx_reset_user (user_id),
  INDEX idx_reset_expires (expires_at),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Market price trends (optional analytics)
CREATE TABLE IF NOT EXISTS price_trends (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  crop VARCHAR(128) NOT NULL,
  region VARCHAR(128) NULL,
  date DATE NOT NULL,
  avg_price NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'ETB',
  UNIQUE KEY uq_price_trends (crop, region, date),
  INDEX idx_price_crop_region (crop, region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add missing indexes for performance
ALTER TABLE produce_listings ADD INDEX idx_listings_region (region);
ALTER TABLE produce_listings ADD INDEX idx_listings_woreda (woreda);
ALTER TABLE produce_listings ADD INDEX idx_listings_price (price_per_unit);
ALTER TABLE produce_listings ADD INDEX idx_listings_quantity (quantity);
ALTER TABLE produce_listings ADD INDEX idx_listings_available_from (available_from);
ALTER TABLE produce_listings ADD INDEX idx_listings_available_until (available_until);

-- Add constraints for data validation
ALTER TABLE produce_listings ADD CONSTRAINT chk_price_positive CHECK (price_per_unit > 0);
ALTER TABLE produce_listings ADD CONSTRAINT chk_quantity_positive CHECK (quantity > 0);
ALTER TABLE produce_listings ADD CONSTRAINT chk_available_dates CHECK (available_until IS NULL OR available_from IS NULL OR available_until >= available_from);

ALTER TABLE orders ADD CONSTRAINT chk_subtotal_positive CHECK (subtotal >= 0);
ALTER TABLE orders ADD CONSTRAINT chk_delivery_fee_positive CHECK (delivery_fee >= 0);

ALTER TABLE order_items ADD CONSTRAINT chk_item_price_positive CHECK (price_per_unit > 0);
ALTER TABLE order_items ADD CONSTRAINT chk_item_quantity_positive CHECK (quantity > 0);

ALTER TABLE reviews ADD CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5);

-- Add triggers for automatic updates
DELIMITER $$

CREATE TRIGGER update_user_rating_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
  UPDATE users u
  JOIN produce_listings pl ON pl.id = NEW.listing_id
  SET 
    u.avg_rating = (
      SELECT AVG(rating) 
      FROM reviews r 
      JOIN produce_listings pl2 ON pl2.id = r.listing_id 
      WHERE pl2.farmer_user_id = pl.farmer_user_id
    ),
    u.review_count = (
      SELECT COUNT(*) 
      FROM reviews r 
      JOIN produce_listings pl2 ON pl2.id = r.listing_id 
      WHERE pl2.farmer_user_id = pl.farmer_user_id
    )
  WHERE u.id = pl.farmer_user_id;
END$$

CREATE TRIGGER update_user_rating_after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
  UPDATE users u
  JOIN produce_listings pl ON pl.id = NEW.listing_id
  SET 
    u.avg_rating = (
      SELECT AVG(rating) 
      FROM reviews r 
      JOIN produce_listings pl2 ON pl2.id = r.listing_id 
      WHERE pl2.farmer_user_id = pl.farmer_user_id
    ),
    u.review_count = (
      SELECT COUNT(*) 
      FROM reviews r 
      JOIN produce_listings pl2 ON pl2.id = r.listing_id 
      WHERE pl2.farmer_user_id = pl.farmer_user_id
    )
  WHERE u.id = pl.farmer_user_id;
END$$

CREATE TRIGGER update_user_rating_after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
  UPDATE users u
  JOIN produce_listings pl ON pl.id = OLD.listing_id
  SET 
    u.avg_rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM reviews r 
      JOIN produce_listings pl2 ON pl2.id = r.listing_id 
      WHERE pl2.farmer_user_id = pl.farmer_user_id
    ),
    u.review_count = (
      SELECT COUNT(*) 
      FROM reviews r 
      JOIN produce_listings pl2 ON pl2.id = r.listing_id 
      WHERE pl2.farmer_user_id = pl.farmer_user_id
    )
  WHERE u.id = pl.farmer_user_id;
END$$

DELIMITER ;
