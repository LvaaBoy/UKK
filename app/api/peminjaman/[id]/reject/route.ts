import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'petugas')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.query(
        "UPDATE peminjaman SET status='ditolak' WHERE id=$1",
        [id]
    );

    return NextResponse.json({ message: "Peminjaman ditolak" });
}
