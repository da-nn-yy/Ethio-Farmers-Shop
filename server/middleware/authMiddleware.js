const admin = require('../config/firebase-admin');
const db = require('../config/database');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get user data from database
    const [users] = await db.execute(`
      SELECT id, email, displayName, role, createdAt
      FROM users WHERE firebaseUid = ?
    `, [decodedToken.uid]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    req.user = {
      ...decodedToken,
      ...users[0]
    };

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

const requireFarmer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Farmer access required' });
    }

    next();
  } catch (error) {
    console.error('Error checking farmer role:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const requireBuyer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Buyer access required' });
    }

    next();
  } catch (error) {
    console.error('Error checking buyer role:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  verifyToken,
  requireFarmer,
  requireBuyer
};
