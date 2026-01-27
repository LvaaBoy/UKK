const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

async function debug() {
    const envPath = path.join(process.cwd(), '.env');
    const env = fs.readFileSync(envPath, 'utf8');
    const dbUrlMatch = env.match(/DATABASE_URL=["']?(.*?)["']?(\s|$)/);
    const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

    if (!dbUrl) {
        console.error("No DATABASE_URL found");
        process.exit(1);
    }

    console.log("Connecting to DB...");
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    try {
        console.log("Checking audit_logs columns...");
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'audit_logs'
            ORDER BY ordinal_position
        `);
        console.log("Columns:", JSON.stringify(res.rows, null, 2));

        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables in public:", tables.rows.map(r => r.table_name).join(", "));
    } catch (err) {
        console.error("Debug Error:", err);
    } finally {
        await client.end();
    }
}

debug();
