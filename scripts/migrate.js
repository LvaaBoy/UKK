const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually read .env to avoid dotenv dependency
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
});

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log("Starting migration...");

        // Create audit_logs table
        await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        target_id TEXT,
        details JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log("Migration completed: audit_logs table created or already exists.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
