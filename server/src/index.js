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

// Test the farmer listings endpoint
app.get("/test/farmer-listings", async (req, res) => {
  try {
    // Mock user for testing
    req.user = {
      uid: 'dev_farmer_1',
      email: 'dev@example.com'
    };

    // Import the controller function
    const { getFarmerListings } = await import('./controllers/farmerController.js');

    // Call the controller
    await getFarmerListings(req, res);
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: "Test failed", details: error.message });
  }
});

// Test adding a listing
app.post("/test/add-listing", async (req, res) => {
  try {
    // Mock user for testing
    req.user = {
      uid: 'dev_farmer_1',
      email: 'dev@example.com'
    };

    // Import the controller function
    const { createFarmerListing } = await import('./controllers/farmerController.js');

    // Call the controller
    await createFarmerListing(req, res);
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: "Test failed", details: error.message });
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
