-- Advanced Payment System Database Schema
-- Run this after the basic payment schema

-- Payment Analytics Table
CREATE TABLE IF NOT EXISTS payment_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id VARCHAR(100) NOT NULL,
  user_id BIGINT(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ETB',
  payment_method_type ENUM('bank', 'mobile', 'card', 'cash') NOT NULL,
  processing_time INT NOT NULL, -- in milliseconds
  success BOOLEAN NOT NULL,
  bank_code VARCHAR(10),
  provider_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_payment_id (payment_id),
  INDEX idx_created_at (created_at),
  INDEX idx_payment_method_type (payment_method_type)
);

-- Daily Payment Metrics Table
CREATE TABLE IF NOT EXISTS daily_payment_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL UNIQUE,
  total_transactions INT DEFAULT 0,
  total_amount DECIMAL(15, 2) DEFAULT 0,
  successful_transactions INT DEFAULT 0,
  failed_transactions INT DEFAULT 0,
  processing_fees DECIMAL(15, 2) DEFAULT 0,
  bank_transactions INT DEFAULT 0,
  mobile_transactions INT DEFAULT 0,
  cash_transactions INT DEFAULT 0,
  card_transactions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date)
);

-- Hourly Payment Metrics Table
CREATE TABLE IF NOT EXISTS hourly_payment_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  hour TINYINT NOT NULL,
  total_transactions INT DEFAULT 0,
  total_amount DECIMAL(15, 2) DEFAULT 0,
  successful_transactions INT DEFAULT 0,
  failed_transactions INT DEFAULT 0,
  processing_fees DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_date_hour (date, hour),
  INDEX idx_date (date),
  INDEX idx_hour (hour)
);

-- Payment Alerts Table
CREATE TABLE IF NOT EXISTS payment_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL,
  data JSON NOT NULL,
  status ENUM('active', 'resolved', 'dismissed') DEFAULT 'active',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
);

-- Payment Risk Assessment Table
CREATE TABLE IF NOT EXISTS payment_risk_assessments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id VARCHAR(100) NOT NULL,
  user_id BIGINT(20) NOT NULL,
  risk_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
  risk_score DECIMAL(3, 2) NOT NULL,
  risk_factors JSON NOT NULL,
  recommendation ENUM('PROCEED', 'REVIEW', 'BLOCK') NOT NULL,
  requires_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payment_id (payment_id),
  INDEX idx_user_id (user_id),
  INDEX idx_risk_level (risk_level),
  INDEX idx_requires_review (requires_review)
);

-- Payment Settlement Table
CREATE TABLE IF NOT EXISTS payment_settlements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id VARCHAR(100) NOT NULL,
  bank_code VARCHAR(10),
  provider_code VARCHAR(10),
  settlement_amount DECIMAL(10, 2) NOT NULL,
  processing_fee DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  settlement_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  settlement_time VARCHAR(20), -- e.g., 'T+0', 'T+1', 'T+2'
  bank_reference VARCHAR(100),
  provider_reference VARCHAR(100),
  settled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payment_id (payment_id),
  INDEX idx_settlement_status (settlement_status),
  INDEX idx_bank_code (bank_code),
  INDEX idx_provider_code (provider_code)
);

-- Payment Reconciliation Table
CREATE TABLE IF NOT EXISTS payment_reconciliations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reconciliation_date DATE NOT NULL,
  bank_code VARCHAR(10),
  provider_code VARCHAR(10),
  total_transactions INT NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  reconciled_amount DECIMAL(15, 2) NOT NULL,
  discrepancy_amount DECIMAL(15, 2) DEFAULT 0,
  reconciliation_status ENUM('pending', 'in_progress', 'completed', 'discrepancy') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_reconciliation_date (reconciliation_date),
  INDEX idx_bank_code (bank_code),
  INDEX idx_provider_code (provider_code),
  INDEX idx_reconciliation_status (reconciliation_status)
);

-- Payment Audit Log Table
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id VARCHAR(100) NOT NULL,
  user_id BIGINT(20) NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSON,
  new_values JSON,
  performed_by BIGINT(20) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payment_id (payment_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_performed_by (performed_by),
  INDEX idx_created_at (created_at)
);

-- Payment Configuration Table
CREATE TABLE IF NOT EXISTS payment_configurations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value JSON NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_config_key (config_key),
  INDEX idx_is_active (is_active)
);

-- Insert default payment configurations
INSERT INTO payment_configurations (config_key, config_value, description) VALUES
('fraud_detection', '{"enabled": true, "risk_threshold": 0.7, "auto_block": false}', 'Fraud detection settings'),
('processing_fees', '{"default_rate": 0.02, "bank_rate": 0.015, "mobile_rate": 0.01}', 'Processing fee rates'),
('limits', '{"min_amount": 1, "max_amount": 1000000, "daily_limit": 50000}', 'Payment limits'),
('notifications', '{"email": true, "sms": true, "push": true}', 'Notification preferences'),
('settlement', '{"auto_settle": true, "settlement_time": "T+1", "reconciliation_frequency": "daily"}', 'Settlement settings');

-- Insert sample analytics data for testing
INSERT INTO payment_analytics (payment_id, user_id, amount, currency, payment_method_type, processing_time, success, bank_code, provider_code) VALUES
('PAY_CBE_1234567890', 1, 2500.00, 'ETB', 'bank', 1200, TRUE, 'CBE', NULL),
('PAY_TEL_1234567891', 1, 1200.00, 'ETB', 'mobile', 800, TRUE, NULL, 'TEL'),
('PAY_DASH_1234567892', 2, 3500.00, 'ETB', 'bank', 1500, TRUE, 'DASH', NULL),
('PAY_AMOLE_1234567893', 2, 950.00, 'ETB', 'mobile', 600, TRUE, NULL, 'AMOLE'),
('PAY_CBE_1234567894', 1, 1800.00, 'ETB', 'bank', 2000, FALSE, 'CBE', NULL);

-- Insert sample daily metrics
INSERT INTO daily_payment_metrics (date, total_transactions, total_amount, successful_transactions, failed_transactions, processing_fees, bank_transactions, mobile_transactions, cash_transactions, card_transactions) VALUES
(CURDATE(), 5, 9950.00, 4, 1, 149.25, 3, 2, 0, 0),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 8, 15200.00, 7, 1, 228.00, 5, 3, 0, 0),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 12, 18900.00, 11, 1, 283.50, 8, 4, 0, 0);

-- Insert sample alerts
INSERT INTO payment_alerts (type, data, status, priority) VALUES
('HIGH_VALUE_TRANSACTION', '{"paymentId": "PAY_CBE_1234567890", "amount": 2500, "userId": 1}', 'active', 'medium'),
('HIGH_FAILURE_RATE', '{"userId": 1, "failureRate": 0.25}', 'active', 'high'),
('UNUSUAL_PATTERN', '{"paymentId": "PAY_TEL_1234567891", "userId": 1, "pattern": "NIGHT_TRANSACTION"}', 'resolved', 'low');
