import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { nama, username, role } = await req.json();

    await db.query(
        "UPDATE users SET nama=$1, username=$2, role=$3 WHERE id=$4",
        [nama, username, role, id]
    );

    return NextResponse.json({ message: "User berhasil diupdate" });
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        // Basic protection: don't delete if related to peminjaman (handled by DB constraints usually)
        await db.query("DELETE FROM users WHERE id=$1", [id]);
        return NextResponse.json({ message: "User berhasil dihapus" });
    } catch (error) {
        return NextResponse.json({ error: "Gagal menghapus user. Mungkin masih terkait dengan data transaksi." }, { status: 500 });
    }
}
