import express from "express";
import cors from "cors";
import "dotenv/config";

// Initialize Firebase Admin once
import "./config/firebase.js";

// Routers
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import listingRouter from "./routes/listingRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import favoriteRouter from "./routes/favoriteRoutes.js";

// App
const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Mount routes
app.use(authRouter);
app.use(userRouter);
app.use(listingRouter);
app.use(orderRouter);
app.use(favoriteRouter);

// Start server
const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
