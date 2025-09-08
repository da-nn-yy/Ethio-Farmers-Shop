import { pool } from "../config/database.js";
import admin from "../config/firebase.js";

export const syncUser = async (req, res) => {
  const uid = req.user.uid;
  const [rows] = await pool.query("SELECT id FROM users WHERE firebase_uid = ?", [uid]);
  if (rows.length === 0) {
    await pool.query("INSERT INTO users (firebase_uid, role) VALUES (?, ?)", [uid, "buyer"]);
  }
  res.json({ ok: true });
};

// User registration with Firebase + MySQL dual registration
export const registerUser = async (req, res) => {
  try {
    const { email, password, full_name, phone, role, region, woreda } = req.body;

    // Validate required fields
    if (!email || !password || !full_name || !phone || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists in MySQL
    const [existingUsers] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    try {
      // Step 1: Create user in Firebase Authentication
      const firebaseUser = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: full_name,
        phoneNumber: phone.startsWith('+') ? phone : `+${phone}`
      });

      const firebaseUid = firebaseUser.uid;

      // Step 2: Insert user into MySQL database
      const [result] = await pool.query(
        `INSERT INTO users (firebase_uid, email, full_name, phone, role, region, woreda)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [firebaseUid, email, full_name, phone, role, region || null, woreda || null]
      );

      // Step 3: Create role-specific profile
      if (role === 'farmer') {
        await pool.query(
          `INSERT INTO farmer_profiles (user_id, farm_name)
           VALUES (?, ?)`,
          [result.insertId, `${full_name}'s Farm`]
        );
      } else if (role === 'buyer') {
        await pool.query(
          `INSERT INTO buyer_profiles (user_id)
           VALUES (?)`,
          [result.insertId]
        );
      }

      // Step 4: Set custom claims for role-based access
      await admin.auth().setCustomUserClaims(firebaseUid, {
        role: role,
        userId: result.insertId
      });

      res.status(201).json({
        message: "User registered successfully in both Firebase and MySQL",
        user: {
          id: result.insertId,
          firebase_uid: firebaseUid,
          email,
          full_name,
          role,
          region,
          woreda
        },
        firebase_user: {
          uid: firebaseUid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        }
      });

    } catch (firebaseError) {
      console.error('Firebase registration error:', firebaseError);

      // If Firebase fails, clean up any partial MySQL data
      if (firebaseError.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: "User already exists in Firebase with this email" });
      }

      return res.status(500).json({
        error: "Failed to create Firebase user",
        details: firebaseError.message
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Development login (bypasses Firebase for testing)
// removed devLogin: Firebase client should be used for auth

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    // Look up user by Firebase UID
    const [users] = await pool.query(
      "SELECT * FROM users WHERE firebase_uid = ?",
      [uid]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];
    res.json({
      user: {
        id: user.id,
        firebase_uid: user.firebase_uid,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        region: user.region,
        woreda: user.woreda,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
};
