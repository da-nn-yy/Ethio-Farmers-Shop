import { pool } from "../config/database.js";
import admin from "../config/firebase.js";
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

    const isFirebaseConfigured = (() => {
      try { return admin?.apps?.length > 0; } catch { return false; }
    })();

    // Development bypass only if Firebase is not configured
    if (!isFirebaseConfigured && process.env.NODE_ENV === 'development') {
      // Development path: skip Firebase, create user in MySQL only
      const generatedUid = `dev_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const [result] = await pool.query(
        `INSERT INTO users (firebase_uid, email, full_name, phone, role, region, woreda)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [generatedUid, email, full_name, phone || null, role, region || null, woreda || null]
      );
      // Ensure avatar table exists (non-blocking)
      try {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS user_avatars (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            url VARCHAR(1024) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (user_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
        );
      } catch (_) {}

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

      return res.status(201).json({
        message: "User registered successfully (development mode, Firebase skipped)",
        user: {
          id: result.insertId,
          firebase_uid: generatedUid,
          email,
          full_name,
          role,
          region,
          woreda
        }
      });
    }

    try {
      // Normalize phone to E.164 if present
      const normalizedPhone = (() => {
        if (!phone) return undefined;
        const trimmed = String(phone).trim();
        if (!trimmed) return undefined;
        return trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
      })();

      // Check if phone already exists in Firebase; if so, skip attaching phone to Firebase user
      let usePhoneForFirebase = Boolean(normalizedPhone);
      if (normalizedPhone) {
        try {
          await admin.auth().getUserByPhoneNumber(normalizedPhone);
          // If no error: phone exists -> do not send phone to Firebase
          usePhoneForFirebase = false;
        } catch (lookupErr) {
          // If user-not-found, we can use the phone. Otherwise, be conservative and skip
          if (!(lookupErr && lookupErr.code === 'auth/user-not-found')) {
            usePhoneForFirebase = false;
          }
        }
      }

      // Production path: Create user in Firebase then in MySQL
      const firebaseUser = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: full_name,
        ...(usePhoneForFirebase ? { phoneNumber: normalizedPhone } : {})
      });

      const firebaseUid = firebaseUser.uid;

      const [result] = await pool.query(
        `INSERT INTO users (firebase_uid, email, full_name, phone, role, region, woreda)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [firebaseUid, email, full_name, phone || null, role, region || null, woreda || null]
      );
      // Ensure avatar table exists (non-blocking)
      try {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS user_avatars (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            url VARCHAR(1024) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (user_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
        );
      } catch (_) {}

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

      await admin.auth().setCustomUserClaims(firebaseUid, {
        role: role,
        userId: result.insertId
      });

      return res.status(201).json({
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
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        }
      });

    } catch (firebaseError) {
      console.error('Firebase registration error:', firebaseError);
      // If phone number is already in use, retry without phoneNumber
      if (firebaseError.code === 'auth/phone-number-already-exists') {
        try {
          const fallbackUser = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: full_name,
          });

          const firebaseUid = fallbackUser.uid;

          const [result] = await pool.query(
            `INSERT INTO users (firebase_uid, email, full_name, phone, role, region, woreda)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firebaseUid, email, full_name, phone || null, role, region || null, woreda || null]
          );

          try {
            await pool.query(
              `CREATE TABLE IF NOT EXISTS user_avatars (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                url VARCHAR(1024) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (user_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
            );
          } catch (_) {}

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

          await admin.auth().setCustomUserClaims(firebaseUid, {
            role: role,
            userId: result.insertId
          });

          return res.status(201).json({
            message: "User registered successfully (phone already in use; created without phone in Firebase)",
            user: {
              id: result.insertId,
              firebase_uid: firebaseUid,
              email,
              full_name,
              role,
              region,
              woreda
            }
          });
        } catch (retryError) {
          if (retryError.code === 'auth/email-already-exists') {
            return res.status(409).json({ error: "User already exists with this email" });
          }
          return res.status(500).json({ error: "Failed to register user", details: retryError.message });
        }
      }

      if (firebaseError.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: "User already exists with this email" });
      }
      if (firebaseError.code === 'auth/phone-number-already-exists') {
        return res.status(409).json({ error: "Phone number already exists" });
      }
      return res.status(500).json({
        error: "Failed to register user",
        details: firebaseError.message
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Development login (bypasses Firebase for testing)
export const devLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user in MySQL by email
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // Simple password check for development
    if (password.length < 6) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a simple dev token for testing
    const devToken = `dev-token-${user.id}-${Date.now()}`;

    res.json({
      message: "Development login successful",
      devToken, // Use this for testing protected endpoints
      user: {
        id: user.id,
        firebase_uid: user.firebase_uid,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        region: user.region,
        woreda: user.woreda
      }
    });

  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({ error: "Failed to login" });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    let users;

    // Handle dev tokens differently
    if (uid.startsWith('dev-uid-')) {
      // Dev token - use the user ID directly
      const userId = uid.replace('dev-uid-', '');
      [users] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );
    } else {
      // Real Firebase token - search by firebase_uid
      [users] = await pool.query(
        "SELECT * FROM users WHERE firebase_uid = ?",
        [uid]
      );
    }

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

// Email service configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Forgot password - send reset link
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const [users] = await pool.query(
      "SELECT id, full_name, email FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }

    const user = users[0];

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token in database
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, resetToken, expiresAt]
    );

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Send email (only if SMTP is configured)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = createEmailTransporter();
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Password Reset - Ethio Farmers Shop',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">Password Reset Request</h2>
              <p>Hello ${user.full_name},</p>
              <p>You requested a password reset for your Ethio Farmers Shop account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <p><strong>This link will expire in 15 minutes.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">Ethio Farmers Shop Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      // Development mode - log the reset URL
      console.log(`🔗 Password reset URL for ${email}: ${resetUrl}`);
    }

    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};

// Reset password - validate token and update password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Find valid reset token
    const [tokens] = await pool.query(
      `SELECT prt.id, prt.user_id, prt.expires_at, u.email, u.firebase_uid
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = ? AND prt.expires_at > NOW()`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const resetToken = tokens[0];

    // Check if Firebase is configured
    const isFirebaseConfigured = (() => {
      try { return admin?.apps?.length > 0; } catch { return false; }
    })();

    if (isFirebaseConfigured) {
      try {
        // Update password in Firebase
        await admin.auth().updateUser(resetToken.firebase_uid, {
          password: newPassword
        });
      } catch (firebaseError) {
        console.error('Firebase password update failed:', firebaseError);
        return res.status(500).json({ error: "Failed to update password" });
      }
    }

    // Delete used reset token
    await pool.query("DELETE FROM password_reset_tokens WHERE id = ?", [resetToken.id]);

    res.json({
      message: "Password has been reset successfully. You can now log in with your new password."
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

// Verify reset token (for frontend validation)
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const [tokens] = await pool.query(
      `SELECT prt.expires_at, u.email
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = ? AND prt.expires_at > NOW()`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    res.json({
      valid: true,
      email: tokens[0].email,
      expiresAt: tokens[0].expires_at
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ error: "Failed to verify reset token" });
  }
};
