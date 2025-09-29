import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

console.log("🔍 Connecting to database...");

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});


pool.on('connect', () => {
    console.log('✅ Connected to Supabase database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
});

export default pool;