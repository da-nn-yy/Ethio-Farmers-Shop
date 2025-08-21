// server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Allows server to accept JSON in request bodies

// Basic test route to see if the server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from the Yabelat backend!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});