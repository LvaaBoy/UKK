import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const client = await db.connect();
        try {
            // Existing enum updates
            await client.query("ALTER TYPE status_peminjaman ADD VALUE IF NOT EXISTS 'pending_kembali'");
            await client.query("ALTER TYPE status_peminjaman ADD VALUE IF NOT EXISTS 'kembali'");

            // New audit_logs table
            await client.query(`
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    action TEXT NOT NULL,
                    target_id TEXT,
                    details JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Rename timestamp to created_at if it exists from previous version
            try {
                await client.query(`
                    DO $$ 
                    BEGIN 
                        IF EXISTS (SELECT 1 FROM information_schema.columns 
                                   WHERE table_name='audit_logs' AND column_name='timestamp') THEN
                            ALTER TABLE audit_logs RENAME COLUMN "timestamp" TO "created_at";
                        END IF;
                    END $$;
                `);
            } catch (renameErr) {
                console.error("Rename column error (might already be renamed):", renameErr);
            }
            // Insert sample audit data if table is empty
            const countAudit = await client.query("SELECT COUNT(*) FROM audit_logs");
            if (parseInt(countAudit.rows[0].count) === 0) {
                await client.query(`
                    INSERT INTO audit_logs (user_id, action, target_id, details)
                    SELECT id, 'SYSTEM_RECOVERY', 'DATABASE', '{"message": "Auto-recovery migration completed successfully"}'::jsonb
                    FROM users WHERE role = 'admin' LIMIT 1;
                    
                    INSERT INTO audit_logs (user_id, action, target_id, details)
                    SELECT id, 'LOGIN_SUCCESS', 'SECURITY', '{"ip": "127.0.0.1", "device": "Admin Browser"}'::jsonb
                    FROM users WHERE role = 'admin' LIMIT 1;
                `);
            }

            return NextResponse.json({ success: true, message: "Database schema updated and sample data seeded" });
        } finally {
            client.release();
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
