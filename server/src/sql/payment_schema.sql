-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('bank', 'mobile', 'card', 'cash') NOT NULL,
  details JSON NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_verified (is_verified)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_id INT,
  payment_method_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ETB',
  status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  payment_id VARCHAR(100),
  description TEXT,
  failure_reason TEXT,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE RESTRICT,
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id),
  INDEX idx_payment_method_id (payment_method_id),
  INDEX idx_status (status),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_created_at (created_at)
);

-- Payment Verification Codes Table
CREATE TABLE IF NOT EXISTS payment_verification_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  payment_method_id INT,
  code VARCHAR(10) NOT NULL,
  type ENUM('sms', 'email', 'call') DEFAULT 'sms',
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_code (code),
  INDEX idx_expires_at (expires_at)
);

-- Payment Refunds Table
CREATE TABLE IF NOT EXISTS payment_refunds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  INDEX idx_payment_id (payment_id),
  INDEX idx_status (status)
);

-- Payment Webhooks Table (for external payment providers)
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSON NOT NULL,
  signature VARCHAR(255),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_provider (provider),
  INDEX idx_event_type (event_type),
  INDEX idx_processed (processed)
);

-- Insert sample payment methods for testing
INSERT INTO payment_methods (user_id, type, details, is_verified, is_default) VALUES
(1, 'bank', '{"bankName": "cbe", "accountNumber": "1000123456789", "accountHolderName": "Test User", "bankCode": "CBE"}', TRUE, TRUE),
(1, 'mobile', '{"provider": "telebirr", "phoneNumber": "+251912345678", "accountName": "Test User"}', TRUE, FALSE),
(1, 'cash', '{"method": "cash_on_delivery"}', TRUE, FALSE),
(2, 'bank', '{"bankName": "dashen", "accountNumber": "2000987654321", "accountHolderName": "Farmer User", "bankCode": "DASH"}', TRUE, TRUE),
(2, 'mobile', '{"provider": "amole", "phoneNumber": "+251911234567", "accountName": "Farmer User"}', TRUE, FALSE);

-- Insert sample payments for testing
INSERT INTO payments (user_id, order_id, payment_method_id, amount, currency, status, transaction_id, payment_id, description) VALUES
(1, 1, 1, 2500.00, 'ETB', 'completed', 'TXN123456789', 'PAY123456789', 'Payment for agricultural products'),
(1, 2, 2, 1200.00, 'ETB', 'completed', 'TXN123456790', 'PAY123456790', 'Mobile payment for seeds'),
(2, 3, 4, 3500.00, 'ETB', 'completed', 'TXN123456791', 'PAY123456791', 'Payment for farming equipment'),
(1, 4, 3, 1800.00, 'ETB', 'failed', 'TXN123456792', 'PAY123456792', 'Cash on delivery payment'),
(2, 5, 5, 950.00, 'ETB', 'completed', 'TXN123456793', 'PAY123456793', 'Mobile payment for fertilizer');
