const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load server environment variables if present
const serverEnvPath = path.join(process.cwd(), 'server', '.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else {
  dotenv.config();
}

(async () => {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const dbName = process.env.DB_NAME || 'farmconnect';
  const schemaPath = path.join(process.cwd(), 'server', 'src', 'sql', 'schema.sql');

  const firstAdminEmail = process.env.FIRST_ADMIN_EMAIL || 'first.admin@example.com';
  const firstAdminName = process.env.FIRST_ADMIN_NAME || 'First Admin';
  const firstAdminPhone = process.env.FIRST_ADMIN_PHONE || '+251900000000';

  let conn;
  try {
    conn = await mysql.createConnection({ host: dbHost, user: dbUser, password: dbPassword, port: dbPort, multipleStatements: true });

    // Ensure database exists and select it
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${dbName}\``);

    let sql = fs.readFileSync(schemaPath, 'utf8');
    // Remove leading USE statements to respect selected db
    sql = sql.replace(/\bUSE\s+[^;]+;?/gi, '');
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    console.log('Schema applied from', schemaPath);

    // Ensure we are using the target database
    await conn.query(`USE \`${dbName}\``);

    // Insert first admin if not exists
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ? LIMIT 1', [firstAdminEmail]);
    if (existing.length === 0) {
      const [ins] = await conn.query(
        'INSERT INTO users (firebase_uid, email, full_name, phone, role, status) VALUES (UUID(), ?, ?, ?, \'admin\', \'active\')',
        [firstAdminEmail, firstAdminName, firstAdminPhone]
      );
      const userId = ins.insertId;
      await conn.query('INSERT INTO admins (user_id, role, status) VALUES (?, \'superadmin\', \'active\') ON DUPLICATE KEY UPDATE role=VALUES(role), status=VALUES(status)', [userId]);
      console.log('Created first admin with email', firstAdminEmail);
    } else {
      console.log('Admin already exists with email', firstAdminEmail);
    }
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
