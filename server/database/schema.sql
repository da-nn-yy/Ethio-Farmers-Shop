-- EthioFarm Connect Database Schema
-- Run this file to create the necessary tables

CREATE DATABASE IF NOT EXISTS farmconnect;
USE farmconnect;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    role ENUM('farmer', 'buyer') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    region VARCHAR(100),
    woreda VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_firebase_uid (firebase_uid),
    INDEX idx_role (role)
);

-- Produce listings table
CREATE TABLE IF NOT EXISTS produce_listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_am VARCHAR(255),
    description TEXT,
    description_am TEXT,
    category ENUM('vegetables', 'fruits', 'grains', 'legumes', 'spices', 'other') NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    available_quantity DECIMAL(10,2) NOT NULL,
    unit ENUM('kg', 'quintal', 'ton') DEFAULT 'kg',
    location VARCHAR(100) NOT NULL,
    image_url TEXT,
    status ENUM('active', 'inactive', 'sold_out', 'low_stock') DEFAULT 'active',
    harvest_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_location (location)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    farmer_id INT NOT NULL,
    listing_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES produce_listings(id) ON DELETE CASCADE,
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_status (status)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    farmer_id INT NOT NULL,
    listing_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES produce_listings(id) ON DELETE CASCADE,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_listing_id (listing_id),
    INDEX idx_rating (rating)
);

-- Sample data for testing
INSERT INTO users (firebase_uid, role, full_name, phone, email, region, woreda) VALUES
('sample_farmer_1', 'farmer', 'Abebe Kebede', '+251911234567', 'abebe@example.com', 'Addis Ababa', 'Kolfe Keranio'),
('sample_buyer_1', 'buyer', 'Kebede Alemu', '+251922345678', 'kebede@example.com', 'Addis Ababa', 'Bole');

-- Add development user for testing
INSERT IGNORE INTO users (firebase_uid, role, full_name, phone, email, region, woreda) VALUES
('dev_farmer_1', 'farmer', 'Development Farmer', '+251900000000', 'dev@example.com', 'Addis Ababa', 'Development Area');

-- Sample produce listings
INSERT INTO produce_listings (farmer_id, name, name_am, category, price_per_kg, available_quantity, location, status) VALUES
(1, 'Premium Teff', 'ፕሪሚየም ጤፍ', 'grains', 92.00, 150.00, 'Addis Ababa', 'active'),
(1, 'Organic Wheat', 'ኦርጋኒክ ስንዴ', 'grains', 50.00, 200.00, 'Oromia', 'active'),
(1, 'Fresh Tomatoes', 'ትኩስ ቲማቲም', 'vegetables', 18.00, 120.00, 'Addis Ababa', 'active');

-- Sample orders
INSERT INTO orders (buyer_id, farmer_id, listing_id, quantity, unit_price, total_amount, status) VALUES
(2, 1, 1, 5.00, 92.00, 460.00, 'pending'),
(2, 1, 3, 10.00, 18.00, 180.00, 'confirmed');

-- Sample reviews
INSERT INTO reviews (buyer_id, farmer_id, listing_id, rating, comment) VALUES
(2, 1, 1, 5, 'Excellent quality teff, very fresh!'),
(2, 1, 3, 4, 'Good tomatoes, reasonable price');
