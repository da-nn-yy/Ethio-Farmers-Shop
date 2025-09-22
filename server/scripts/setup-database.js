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

    const targetDbName = process.env.DB_NAME || 'ethio_farmers_market';

    // Create database if it doesn't exist, using provided DB_NAME
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDbName}\``);
    console.log(`Database "${targetDbName}" created or already exists`);

    // Use the database
    await connection.query(`USE \`${targetDbName}\``);
    console.log(`Using database "${targetDbName}"`);

    // Read and execute schema with delimiter handling
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.join(process.cwd(), 'src', 'sql', 'schema.sql');

    if (fs.existsSync(schemaPath)) {
      let schema = fs.readFileSync(schemaPath, 'utf8');

      // Remove or replace hard-coded DB statements in schema
      schema = schema
        .replace(/CREATE\s+DATABASE[\s\S]*?;\s*/gi, '')
        .replace(/USE\s+ethio_farmers_market\s*;\s*/gi, '')
        .replace(/USE\s+`?ethio_farmers_market`?\s*;\s*/gi, '');

      // Simple parser to handle custom delimiters (e.g., DELIMITER $$ ... $$)
      const lines = schema.split(/\r?\n/);
      let delimiter = ';';
      let buffer = '';
      const parsedStatements = [];

      const flushBuffer = () => {
        const stmt = buffer.trim();
        if (stmt) parsedStatements.push(stmt);
        buffer = '';
      };

      for (let rawLine of lines) {
        let line = rawLine;
        // strip line comments that start at beginning
        if (/^\s*--/.test(line)) continue;

        const delimMatch = /^\s*DELIMITER\s+(.+)\s*$/i.exec(line);
        if (delimMatch) {
          // On delimiter change, flush current buffer first
          flushBuffer();
          delimiter = delimMatch[1].trim();
          continue;
        }

        buffer += (buffer ? '\n' : '') + line;

        // If buffer ends with current delimiter, emit statement without the delimiter
        if (delimiter && buffer.trim().endsWith(delimiter)) {
          const stmtWithoutDelimiter = buffer.trim().slice(0, -delimiter.length).trim();
          if (stmtWithoutDelimiter) parsedStatements.push(stmtWithoutDelimiter);
          buffer = '';
        }
      }
      // Flush any remaining buffer
      flushBuffer();

      // Execute statements sequentially
      for (const stmt of parsedStatements) {
        try {
          await connection.query(stmt);
          console.log('Executed SQL statement');
        } catch (error) {
          if (!/already exists/i.test(error.message)) {
            console.error('Error executing statement:', error.message);
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
