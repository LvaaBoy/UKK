import { db } from "@/lib/db";
import { getUser } from "@/lib/auth-utils";
import { apiResponse, apiError, logAction } from "@/lib/api-utils";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const currentUser = await getUser();
        if (!currentUser || currentUser.role !== "admin") {
            return apiError("Unauthorized", undefined, 401);
        }

        const { nama, username, role } = await req.json();

        await db.query(
            "UPDATE users SET nama=$1, username=$2, role=$3 WHERE id=$4",
            [nama, username, role, id]
        );

        await logAction(currentUser.id, "UPDATE_USER", id, { nama, username, role });

        return apiResponse({ message: "User updated successfully" });
    } catch (error: any) {
        return apiError("Failed to update user", error.message, 500);
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const currentUser = await getUser();
        if (!currentUser || currentUser.role !== "admin") {
            return apiError("Unauthorized", undefined, 401);
        }

        // Basic protection: don't delete if related to peminjaman (handled by DB constraints usually)
        await db.query("DELETE FROM users WHERE id=$1", [id]);

        await logAction(currentUser.id, "DELETE_USER", id);

        return apiResponse({ message: "User deleted successfully" });
    } catch (error: any) {
        return apiError("Failed to delete user. It may be linked to transaction data.", error.message, 500);
    }
}
