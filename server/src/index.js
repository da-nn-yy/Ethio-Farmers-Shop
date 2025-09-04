import express from "express";
import cors from "cors";
import "dotenv/config";

// Initialize Firebase Admin once
import "./config/firebase.js";

// Main router with all routes
import apiRouter from "./routes/index.js";
// Initialize database connection
import { testConnection } from "./config/database.js";
// App
const app = express();
app.use(cors());

// JSON parsing with better error handling
app.use(express.json({
  limit: '10mb',
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

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Public buyer listings endpoint (no authentication required)
app.get("/public/listings", async (req, res) => {
  try {
    // Test database connection and simple query
    const { pool } = await import('./config/database.js');

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
      ORDER BY pl.created_at DESC
    `);

    res.json({
      success: true,
      count: rows.length,
      listings: rows
    });
  } catch (error) {
    console.error('Public listings error:', error);
    res.status(500).json({ error: "Failed to fetch listings", details: error.message });
  }
});

// Global error handler for JSON parsing errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON Parse Error:', error.message);
    return res.status(400).json({
      error: 'Invalid JSON format',
      message: 'The request body contains invalid JSON'
    });
  }
  next(error);
});

// Mount API routes
app.use('/api', apiRouter);

// Start server
const port = Number(process.env.PORT || 5000);
app.listen(port, async () => {
  console.log(`API listening on http://localhost:${port}`);

  // Test database connection (non-blocking)
  try {
    await testConnection();
  } catch (error) {
    console.warn('⚠️  Database connection failed, but server is running');
    console.warn('   Make sure MySQL is running and the database exists');
  }
});
