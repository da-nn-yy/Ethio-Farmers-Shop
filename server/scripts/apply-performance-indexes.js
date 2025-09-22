#!/usr/bin/env node
/**
 * Apply performance indexes to improve database query performance
 * Run this script to add indexes that will significantly improve listings loading speed
 */

import { pool } from './src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyPerformanceIndexes() {
  try {
    console.log('🚀 Applying performance indexes...');
    
    // Read the indexes SQL file
    const indexPath = path.join(__dirname, 'src', 'sql', 'performance_indexes.sql');
    const indexSQL = fs.readFileSync(indexPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = indexSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await pool.query(statement);
        console.log('✅ Success');
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠️  Index already exists, skipping...');
        } else {
          console.error('❌ Error executing statement:', error.message);
        }
      }
    }
    
    console.log('🎉 Performance indexes applied successfully!');
    console.log('📊 Database queries should now be significantly faster');
    
  } catch (error) {
    console.error('❌ Failed to apply performance indexes:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
applyPerformanceIndexes();
