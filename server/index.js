const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// EthioFarmers Middleware
app.use(cors());
app.use(express.json());

// Db connection

app.get('/api/test-db', async (req,res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users');
    res.json({message: "Database connection successful!", users: rows})
  } catch (error) {
    console.error('Database connection failed', error);
    res.status(500).json({message: "Database connection failed!"});
  }
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from Ethio Farmers backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
