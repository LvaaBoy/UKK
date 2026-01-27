import { db } from "@/lib/db";
import { getUser } from "@/lib/auth-utils";
import { apiResponse, apiError } from "@/lib/api-utils";

export async function GET() {
    try {
        const user = await getUser();
        if (!user || (user.role !== "admin" && user.role !== "petugas")) {
            return apiError("Unauthorized", undefined, 401);
        }

        const result = await db.query("SELECT id, nama, username, role, created_at FROM users ORDER BY created_at DESC");
        return apiResponse(result.rows);
    } catch (error: any) {
        return apiError("Failed to fetch users", error.message, 500);
    }
}
