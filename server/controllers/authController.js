const db = require('./config/database');

// EthioFarmers Register

const registerUser = async (req, res) => {
    const { email, role, name, phone, location } = req.body;
    const firebase_uid = req.user.uid;

    try {
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE firebase_uid = ?', [firebase_uid]);

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
    }
     const [userResult] = await db.execute(
      'INSERT INTO users (firebase_uid, email, role) VALUES (?, ?, ?)',
      [firebase_uid, email, role]
    );

    const userId = userResult.insertId;
    await db.execute(
      'INSERT INTO profiles (user_id, full_name, phone_number, location) VALUES (?, ?, ?, ?)',
      [userId, name, phone || null, location || null]
    );

    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

}

// Login route (fetch user info using Firebase UID)
const login = async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
    const [users] = await db.execute(
      `SELECT u.id as userId, u.email, u.role, u.created_at,
              p.full_name, p.phone_number, p.location, p.bio, p.preferred_language
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.firebase_uid = ?`,
      [firebase_uid]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Login successful', user: users[0] });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  login
};

// login 
