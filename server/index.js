const express = require('express');
const cors = require('cors');
const verifyToken = require('./middleware/authMiddleware');
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

app.get('/api/protected', verifyToken, (req ,res) => {
    res.json({
      message: "You are accessed the protected route!",
      user: req.user
    });
});

// register and login routes

app.post('/api/register', verifyToken, async (req, res) => {
    const { email,role } = req.body;
    const firebase_uid = req.user.uid;

    try{
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE firebase_uid = ?', [firebase_uid]);

        if(existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exist' });
        }
        const [result] = await db.execute('INSERT INTO users (firebase_uid,email,role) VALUES (?, ?, ?)', [firebase_uid,email,role]);
        res.status(201).json({ message: 'User registered successfully', userId: result[0].insertId });
    }catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from Ethio Farmers backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
