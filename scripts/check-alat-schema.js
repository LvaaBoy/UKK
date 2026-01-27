const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_5TX7FQZENPUx@ep-mute-flower-ahwxhg85-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'alat'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkSchema();
