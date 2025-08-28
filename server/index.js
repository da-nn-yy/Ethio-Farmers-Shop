import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";



const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use(authRoutes);
app.use(userRoutes);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
