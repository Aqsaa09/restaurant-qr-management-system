const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT, 10) || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'root',
  database: process.env.PG_DATABASE || 'restaurant',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
  return res;
};

const testConnection = async () => {
  try {
    const res = await query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully to database:', process.env.PG_DATABASE || 'restaurant');
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
