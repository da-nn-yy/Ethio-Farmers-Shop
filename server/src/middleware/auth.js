import admin from "../config/firebase.js";

export const authGuard = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    // Accept dev tokens in non-production environments regardless of Firebase config
    if (process.env.NODE_ENV !== 'production' && token && token.startsWith('dev-token-')) {
      const idPart = token.split('-')[2] || '1';
      const userId = Number(idPart) || 1;
      
      // Get the actual firebase_uid from the database to ensure consistency
      try {
        const { pool } = await import('../config/database.js');
        const [users] = await pool.query('SELECT firebase_uid FROM users WHERE id = ?', [userId]);
        if (users.length > 0) {
          req.user = { uid: users[0].firebase_uid, id: userId };
        } else {
          req.user = { uid: `dev-uid-${idPart}`, id: userId };
        }
      } catch (error) {
        console.error('Error fetching user firebase_uid:', error);
        req.user = { uid: `dev-uid-${idPart}`, id: userId };
      }
      return next();
    }

    // Development convenience: if Firebase not configured at all, allow anonymous dev user
    if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
      // Try to get the first user's firebase_uid from the database
      try {
        const { pool } = await import('../config/database.js');
        const [users] = await pool.query('SELECT firebase_uid FROM users WHERE id = 1 LIMIT 1');
        if (users.length > 0) {
          req.user = { uid: users[0].firebase_uid, id: 1 };
        } else {
          req.user = { uid: 'dev-uid-1', id: 1 };
        }
      } catch (error) {
        console.error('Error fetching default user firebase_uid:', error);
        req.user = { uid: 'dev-uid-1', id: 1 };
      }
      return next();
    }

    if (!token) return res.status(401).json({ error: "Missing token" });
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    // If verification fails in development, try treating as dev token
    if (process.env.NODE_ENV !== 'production') {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (token && token.startsWith('dev-token-')) {
        const idPart = token.split('-')[2] || '1';
        const userId = Number(idPart) || 1;
        
        // Get the actual firebase_uid from the database to ensure consistency
        try {
          const { pool } = await import('../config/database.js');
          const [users] = await pool.query('SELECT firebase_uid FROM users WHERE id = ?', [userId]);
          if (users.length > 0) {
            req.user = { uid: users[0].firebase_uid, id: userId };
          } else {
            req.user = { uid: `dev-uid-${idPart}`, id: userId };
          }
        } catch (error) {
          console.error('Error fetching user firebase_uid:', error);
          req.user = { uid: `dev-uid-${idPart}`, id: userId };
        }
        return next();
      }
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};
