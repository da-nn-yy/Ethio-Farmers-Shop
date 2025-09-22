import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";

// Initialize Firebase Admin once
import "./config/firebase.js";

// Main router with all routes
import apiRouter from "./routes/index.js";
// Initialize database connection
import { testConnection, pool } from "./config/database.js";
// Error handling
import { globalErrorHandler, notFoundHandler } from "./utils/errorHandler.js";

// App
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// JSON parsing with better error handling
app.use(express.json({
  limit: process.env.MAX_REQUEST_SIZE || '10mb',
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length > 0) {
      try {
        JSON.parse(buf);
      } catch (e) {
        console.error('JSON Parse Error:', e.message);
        console.error('Raw buffer (first 100 chars):', buf.toString().substring(0, 100));
        console.error('Buffer length:', buf.length);
        // Don't throw error here, let express handle it
      }
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to log requests (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
  });
}

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Public buyer listings endpoint (no authentication required)
app.get("/public/listings", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        pl.id,
        pl.title as name,
        pl.crop as category,
        pl.price_per_unit as pricePerKg,
        pl.quantity as availableQuantity,
        pl.region as location,
        pl.status,
        u.id as farmerUserId,
        u.full_name as farmerName,
        li.url as image,
        ua.url as farmerAvatar,
        pl.created_at as createdAt
      FROM produce_listings pl
      JOIN users u ON pl.farmer_user_id = u.id
      LEFT JOIN listing_images li ON pl.id = li.listing_id AND li.sort_order = 0
      LEFT JOIN user_avatars ua ON ua.user_id = u.id
      WHERE pl.status = 'active' AND pl.quantity > 0
      ORDER BY pl.created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      count: rows.length,
      listings: rows
    });
  } catch (error) {
    console.error('Public listings error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch listings",
      details: error.message
    });
  }
});

// Global error handler for JSON parsing errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON Parse Error:', error.message);
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format',
      message: 'The request body contains invalid JSON'
    });
  }
  next(error);
});

// Mount API routes
app.use('/api', apiRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Start server
const port = Number(process.env.PORT || 5000);
app.listen(port, async () => {
  console.log(`🚀 API listening on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Test database connection (non-blocking)
  try {
    const connected = await testConnection();
    if (connected) {
      console.log('✅ Database connection successful');
      try {
        // Ensure required tables exist (idempotent)
        await pool.query(`CREATE TABLE IF NOT EXISTS listing_images (
          id INT PRIMARY KEY AUTO_INCREMENT,
          listing_id INT NOT NULL,
          url TEXT NOT NULL,
          sort_order INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_images_listing (listing_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        await pool.query(`CREATE TABLE IF NOT EXISTS favorites (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          buyer_user_id BIGINT NOT NULL,
          listing_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_fav_buyer_listing (buyer_user_id, listing_id),
          INDEX idx_fav_buyer (buyer_user_id),
          INDEX idx_fav_listing (listing_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        await pool.query(`CREATE TABLE IF NOT EXISTS orders (
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
          INDEX idx_orders_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        await pool.query(`CREATE TABLE IF NOT EXISTS order_items (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          order_id BIGINT NOT NULL,
          listing_id INT NOT NULL,
          crop VARCHAR(128) NOT NULL,
          unit ENUM('kg','ton','crate','bag','unit') NOT NULL,
          price_per_unit NUMERIC(12,2) NOT NULL,
          quantity NUMERIC(12,2) NOT NULL,
          line_total NUMERIC(12,2) GENERATED ALWAYS AS (price_per_unit * quantity) STORED,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_items_order (order_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT NOT NULL,
          type VARCHAR(64) NOT NULL,
          payload JSON NULL,
          is_read TINYINT(1) NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_notif_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        await pool.query(`CREATE TABLE IF NOT EXISTS user_avatars (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT NOT NULL,
          url TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_user_avatar (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        console.log('🧱 Ensured required tables exist');
      } catch (bootErr) {
        console.warn('⚠️  Failed ensuring tables:', bootErr.message);
      }
    } else {
      console.warn('⚠️  Database connection failed, but server is running');
      console.warn('   Make sure MySQL is running and the database exists');
    }
  } catch (error) {
    console.warn('⚠️  Database connection failed, but server is running');
    console.warn('   Make sure MySQL is running and the database exists');
  }
});
