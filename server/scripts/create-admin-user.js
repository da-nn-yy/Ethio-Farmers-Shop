import admin from '../src/config/firebase.js';
import { pool } from '../src/config/database.js';
import 'dotenv/config';

async function createAdminUser() {
  // Get admin details from command line or use defaults
  const email = process.argv[2] || 'admin@ethiofarm.com';
  const password = process.argv[3] || 'Admin123!@#';
  const fullName = process.argv[4] || 'System Administrator';
  const adminRole = process.argv[5] || 'superadmin';
  const phone = process.argv[6] || null;

  console.log('🔐 Creating admin user...');
  console.log('Email:', email);
  console.log('Name:', fullName);
  console.log('Role:', adminRole);
  console.log('');

  try {
    // Check if Firebase is configured
    const isFirebaseConfigured = admin?.apps?.length > 0;
    if (!isFirebaseConfigured) {
      console.error('❌ Firebase is not configured!');
      console.error('Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in server/.env');
      process.exit(1);
    }

    // Check if user already exists in database
    const [existingUsers] = await pool.query(
      "SELECT id, firebase_uid, role FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log('⚠️  User already exists in database');
      console.log('User ID:', existingUser.id);
      console.log('Current role:', existingUser.role);

      if (existingUser.role === 'admin') {
        console.log('✅ User is already an admin');
        process.exit(0);
      }

      // Update existing user to admin
      if (existingUser.firebase_uid && existingUser.firebase_uid.startsWith('admin_')) {
        // User exists but might not be in Firebase
        console.log('Updating existing user to admin role...');
        await pool.query(
          `UPDATE users SET role = 'admin' WHERE id = ?`,
          [existingUser.id]
        );

        // Create admin record if it doesn't exist
        const [adminCheck] = await pool.query(
          "SELECT id FROM admins WHERE user_id = ?",
          [existingUser.id]
        );

        if (adminCheck.length === 0) {
          await pool.query(
            `INSERT INTO admins (user_id, role, status) VALUES (?, ?, 'active')`,
            [existingUser.id, adminRole]
          );
        }

        console.log('✅ User updated to admin role');
        process.exit(0);
      }
    }

    // Create user in Firebase
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: fullName,
        ...(phone ? { phoneNumber: phone } : {})
      });
      console.log('✅ User created in Firebase');
      console.log('Firebase UID:', firebaseUser.uid);
    } catch (firebaseError) {
      if (firebaseError.code === 'auth/email-already-exists') {
        console.log('⚠️  User already exists in Firebase');
        // Try to get existing user
        firebaseUser = await admin.auth().getUserByEmail(email);
        console.log('Using existing Firebase user:', firebaseUser.uid);
      } else {
        throw firebaseError;
      }
    }

    const firebaseUid = firebaseUser.uid;

    // Create or update user in MySQL
    let userId;
    if (existingUsers.length > 0) {
      // Update existing user
      await pool.query(
        `UPDATE users
         SET firebase_uid = ?, role = 'admin', full_name = ?, phone = ?
         WHERE id = ?`,
        [firebaseUid, fullName, phone, existingUsers[0].id]
      );
      userId = existingUsers[0].id;
      console.log('✅ User updated in database');
    } else {
      // Create new user
      const [result] = await pool.query(
        `INSERT INTO users (firebase_uid, email, full_name, phone, role, status)
         VALUES (?, ?, ?, ?, 'admin', 'active')`,
        [firebaseUid, email, fullName, phone]
      );
      userId = result.insertId;
      console.log('✅ User created in database');
    }

    // Create admin record
    const [adminCheck] = await pool.query(
      "SELECT id FROM admins WHERE user_id = ?",
      [userId]
    );

    if (adminCheck.length === 0) {
      await pool.query(
        `INSERT INTO admins (user_id, role, status) VALUES (?, ?, 'active')`,
        [userId, adminRole]
      );
      console.log('✅ Admin record created');
    } else {
      await pool.query(
        `UPDATE admins SET role = ? WHERE user_id = ?`,
        [adminRole, userId]
      );
      console.log('✅ Admin record updated');
    }

    // Create admin profile if table exists
    try {
      const [profileCheck] = await pool.query(
        "SELECT id FROM admin_profiles WHERE user_id = ?",
        [userId]
      );

      if (profileCheck.length === 0) {
        await pool.query(
          `INSERT INTO admin_profiles (user_id, admin_role, permissions)
           VALUES (?, ?, ?)`,
          [userId, adminRole, JSON.stringify({
            canManageUsers: true,
            canManageListings: true,
            canManageOrders: true,
            canViewAnalytics: true,
            canManageSettings: adminRole === 'superadmin'
          })]
        );
        console.log('✅ Admin profile created');
      }
    } catch (profileError) {
      console.log('⚠️  Admin profile table might not exist, skipping...');
    }

    // Set custom claims in Firebase
    await admin.auth().setCustomUserClaims(firebaseUid, {
      role: 'admin',
      userId: userId
    });
    console.log('✅ Firebase custom claims set');

    console.log('');
    console.log('🎉 Admin user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('  Role:', adminRole);
    console.log('');
    console.log('You can now login at: http://localhost:5173/admin-login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }

  // Close database connection
  await pool.end();
  process.exit(0);
}

createAdminUser();


