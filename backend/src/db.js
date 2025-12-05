import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

const { Pool } = pg;

// Debug: Log which database we're connecting to
console.log(
  '🔍 DATABASE_URL:',
  process.env.DATABASE_URL
    ? process.env.DATABASE_URL.includes('neon.tech')
      ? 'Neon Cloud ✅'
      : process.env.DATABASE_URL
    : 'Local fallback ❌'
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ||
  // 'postgresql://neondb_owner:npg_DIF3yHVxG1dL@ep-cool-cell-ahki4eba-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', {
      text,
      duration,
      rows: res.rowCount,
    });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export const end = async () => {
  await pool.end();
};

export default pool;
