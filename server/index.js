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

// Register/Sync Firebase user with MySQL
app.post('/api/auth/register', verifyToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user || {};
    const {
      displayName = name,
      photoURL = picture,
      phone = null,
      role = null
    } = req.body || {};

    if (!uid) {
      return res.status(400).json({ message: 'Invalid token: missing uid' });
    }

    const insertSql = `
      INSERT INTO users (firebase_uid, email, display_name, photo_url, phone, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        display_name = VALUES(display_name),
        photo_url = VALUES(photo_url),
        phone = VALUES(phone),
        role = VALUES(role),
        updated_at = CURRENT_TIMESTAMP
    `;

    await db.execute(insertSql, [uid, email || null, displayName || null, photoURL || null, phone, role]);

    const [rows] = await db.execute('SELECT * FROM users WHERE firebase_uid = ? LIMIT 1', [uid]);
    const user = rows?.[0] || null;
    return res.status(200).json({ message: 'User synced successfully', user });
  } catch (error) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ message: 'Failed to sync user', error: error?.message });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from Ethio Farmers backend!' });
});

async function ensureUsersTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firebase_uid VARCHAR(128) NOT NULL UNIQUE,
      email VARCHAR(255),
      display_name VARCHAR(255),
      photo_url TEXT,
      phone VARCHAR(64),
      role VARCHAR(64),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  try {
    await db.execute(createSql);
    console.log('Users table is ready');
  } catch (err) {
    console.error('Failed to ensure users table:', err);
  }
}

ensureUsersTable().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
