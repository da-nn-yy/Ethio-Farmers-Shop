USE ethio_farmers_db;

-- Users (auth source: Firebase; single row per person)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  role ENUM('farmer','buyer') NOT NULL,
  full_name VARCHAR(255) NULL,
  phone VARCHAR(64) NULL,
  email VARCHAR(255) NULL,
  region VARCHAR(128) NULL,
  woreda VARCHAR(128) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Farmer-specific profile
CREATE TABLE IF NOT EXISTS farmer_profiles (
  user_id BIGINT NOT NULL PRIMARY KEY,
  farm_name VARCHAR(255) NULL,
  farm_size_ha DECIMAL(10,2) NULL,
  certifications JSON NULL,
  crops JSON NULL,
  experience_years INT NULL,
  address TEXT NULL,
  CONSTRAINT fk_farmer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
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
  status ENUM('active','paused','sold','expired') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_listings_farmer (farmer_user_id),
  INDEX idx_listings_crop (crop),
  INDEX idx_listings_status (status),
  CONSTRAINT fk_listing_farmer FOREIGN KEY (farmer_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Listing images
CREATE TABLE IF NOT EXISTS listing_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  listing_id BIGINT NOT NULL,
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
  listing_id BIGINT NOT NULL,
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
  listing_id BIGINT NOT NULL,
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
