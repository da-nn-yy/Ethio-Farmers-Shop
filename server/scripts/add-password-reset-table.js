import { pool } from './src/config/database.js';

async function addPasswordResetTable() {
  try {
    console.log('Adding password_reset_tokens table...');
    
    await pool.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('✅ password_reset_tokens table created successfully!');
    
    // Clean up expired tokens
    await pool.query('DELETE FROM password_reset_tokens WHERE expires_at < NOW()');
    console.log('✅ Cleaned up expired tokens');
    
  } catch (error) {
    console.error('❌ Error adding password reset table:', error);
  } finally {
    await pool.end();
  }
}

addPasswordResetTable();
