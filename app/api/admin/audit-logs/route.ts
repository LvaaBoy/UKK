import { db } from "@/lib/db";
import { getUser } from "@/lib/auth-utils";
import { apiResponse, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const user = await getUser();
        if (!user || user.role !== "admin") {
            return apiError("Unauthorized", undefined, 401);
        }

        // Strictly use created_at now that migration is confirmed
        const result = await db.query(`
            SELECT a.id, a.user_id, a.action, a.target_id, a.details,
                   a.created_at,
                   u.nama as admin_name 
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        `);
        return apiResponse(result.rows);
    } catch (error: any) {
        console.error("[AUDIT_LOGS_ERROR]", error);
        return apiError("Failed to fetch audit logs", error.message, 500);
    }
}
