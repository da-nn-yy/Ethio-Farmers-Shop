import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  let connection;

  try {
    // Connect to MySQL without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS farmconnect');
    console.log('Database "farmconnect" created or already exists');

    // Use the database
    await connection.query('USE farmconnect');
    console.log('Using database "farmconnect"');

    // Read and execute schema
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');

    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema.split(';').filter(stmt => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await connection.query(statement);
            console.log('Executed SQL statement');
          } catch (error) {
            if (!error.message.includes('already exists')) {
              console.error('Error executing statement:', error.message);
            }
          }
        }
      }
      console.log('Database schema setup completed');
    } else {
      console.error('Schema file not found at:', schemaPath);
    }

    // Verify tables exist
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));

  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

setupDatabase();
