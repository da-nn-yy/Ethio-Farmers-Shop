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

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Mount routes
app.use(authRouter);
app.use(userRouter);
app.use(farmerRouter);
app.use('/listings', listingRouter);
app.use('/orders', orderRouter);

// Start server
const port = Number(process.env.PORT || 5000);
app.listen(port, async () => {
  console.log(`API listening on http://localhost:${port}`);

  // Test database connection
  await testConnection();
});
