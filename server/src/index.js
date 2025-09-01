import express from "express";
import cors from "cors";
import "dotenv/config";

// Initialize Firebase Admin once
import "./config/firebase.js";

// Initialize database connection
import { testConnection } from "./config/database.js";


// Routers
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import farmerRouter from "./routes/farmerRoutes.js";
import listingRouter from "./routes/listingRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

// App
const app = express();
app.use(cors());
app.use(express.json());

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
        u.full_name as farmerName
      FROM produce_listings pl
      JOIN users u ON pl.farmer_user_id = u.id
      WHERE pl.status = 'active'
      AND pl.quantity > 0
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

// Mount routes
app.use(authRouter);
app.use(userRouter);
app.use(farmerRouter);
app.use('/listings', listingRouter);
app.use('/orders', orderRouter);

// Start server
const port = Number(process.env.PORT || 5001);
app.listen(port, async () => {
  console.log(`API listening on http://localhost:${port}`);

  // Test database connection
  await testConnection();
});
