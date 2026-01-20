import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { nama_alat, kategori_id, stok } = await req.json();

    await db.query(
        "UPDATE alat SET nama_alat=$1, kategori_id=$2, stok=$3 WHERE id=$4",
        [nama_alat, kategori_id, stok, id]
    );

    return NextResponse.json({ message: "Alat berhasil diupdate" });
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await db.query("DELETE FROM alat WHERE id=$1", [id]);
        return NextResponse.json({ message: "Alat berhasil dihapus" });
    } catch {
        return NextResponse.json({ error: "Gagal menghapus alat. Mungkin masih terkait dengan data peminjaman." }, { status: 500 });
    }
}
