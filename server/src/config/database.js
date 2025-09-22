import mysql from 'mysql2/promise';
import 'dotenv/config';

/**
 * Validate required environment variables
 */
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('   Please check your .env file');
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

/**
 * Create MySQL connection pool
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '', // allow empty password for local dev
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 10000,
  charset: 'utf8mb4',
  timezone: 'Z',
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false,
});

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}`);
    connection.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Please check your database configuration and ensure MySQL is running');
    return false;
  }
};

/**
 * Close connection pool gracefully
 */
export const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Database connection pool closed');
  } catch (err) {
    console.error('❌ Error closing database pool:', err.message);
  }
};

/**
 * Handle process termination signals
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
  await closePool();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

/**
 * Export default pool
 */
export default pool;
