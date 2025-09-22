-- Admin functionality tables

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_setting (category, setting_key),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin actions audit log
CREATE TABLE IF NOT EXISTS admin_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INT,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action_type (action_type),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default system settings
INSERT IGNORE INTO system_settings (category, setting_key, setting_value) VALUES
-- General settings
('general', 'siteName', '"Ethio Farmers Shop"'),
('general', 'siteDescription', '"Connecting farmers with buyers across Ethiopia"'),
('general', 'defaultLanguage', '"en"'),
('general', 'timezone', '"Africa/Addis_Ababa"'),
('general', 'currency', '"ETB"'),
('general', 'maintenanceMode', 'false'),

-- Notification settings
('notifications', 'emailNotifications', 'true'),
('notifications', 'smsNotifications', 'false'),
('notifications', 'pushNotifications', 'true'),
('notifications', 'orderAlerts', 'true'),
('notifications', 'userRegistrationAlerts', 'true'),
('notifications', 'systemAlerts', 'true'),

-- Security settings
('security', 'twoFactorAuth', 'true'),
('security', 'passwordMinLength', '8'),
('security', 'sessionTimeout', '30'),
('security', 'maxLoginAttempts', '5'),
('security', 'ipWhitelist', 'false'),
('security', 'auditLogging', 'true'),

-- Payment settings
('payment', 'stripeEnabled', 'true'),
('payment', 'paypalEnabled', 'false'),
('payment', 'bankTransferEnabled', 'true'),
('payment', 'mobileMoneyEnabled', 'true'),
('payment', 'commissionRate', '5.0'),
('payment', 'minimumPayout', '1000'),

-- Feature settings
('features', 'userRegistration', 'true'),
('features', 'farmerVerification', 'true'),
('features', 'listingApproval', 'true'),
('features', 'orderTracking', 'true'),
('features', 'reviewsEnabled', 'true'),
('features', 'chatEnabled', 'true');

-- Add status column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active', 'pending', 'suspended', 'banned') DEFAULT 'active';

-- Add status column to produce_listings table if it doesn't exist
ALTER TABLE produce_listings ADD COLUMN IF NOT EXISTS status ENUM('active', 'pending', 'suspended', 'rejected', 'expired') DEFAULT 'pending';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_listings_status ON produce_listings(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
