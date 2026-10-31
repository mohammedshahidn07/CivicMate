import 'dotenv/config';
import { db } from './db.js';

async function testConnection() {
  try {
    const result = await db.query('SELECT NOW() AS current_time');

    console.log('✅ Neon database connected!');
    console.log('Database time:', result.rows[0].current_time);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await db.end();
  }
}

testConnection();