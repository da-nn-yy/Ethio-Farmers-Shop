import admin from "../config/firebase.js";

export const authGuard = async (req, res, next) => {
  try {
    // Allow CORS preflight requests to pass through
    if (req.method === 'OPTIONS') {
      return next();
    }

    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ error: "Missing token" });
    const decoded = await admin.auth().verifyIdToken(token);
    // Attach firebase user info
    req.user = decoded;
    // Also enrich with local DB id and role if available
    try {
      const { pool } = await import('../config/database.js');
      const [users] = await pool.query('SELECT id, role FROM users WHERE firebase_uid = ? LIMIT 1', [decoded.uid]);
      if (users.length > 0) {
        req.user.id = users[0].id;
        req.user.role = users[0].role;
      }
    } catch (e) {
      // non-fatal
    }
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Role-based authorization middleware
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      if (!userRole) {
        return res.status(403).json({ error: 'Access denied: role not found' });
      }
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Access denied: insufficient role' });
      }
      next();
    } catch (e) {
      return res.status(403).json({ error: 'Access denied' });
    }
  };
};
