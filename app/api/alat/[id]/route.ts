import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { apiResponse, apiError, logAction } from "@/lib/api-utils";
import { getUser } from "@/lib/auth-utils";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { nama_alat, kategori_id, stok, gambar, deskripsi } = await req.json();

    try {
        const user = await getUser();
        await db.query(
            "UPDATE alat SET nama_alat=$1, kategori_id=$2, stok=$3, gambar=$4, deskripsi=$5 WHERE id=$6",
            [nama_alat, kategori_id, stok, gambar, deskripsi, id]
        );

        if (user) await logAction(user.id, "UPDATE_ALAT", id, { name: nama_alat, stock: stok, image: !!gambar });

        return apiResponse({ message: "Alat berhasil diupdate" });
    } catch (error: any) {
        return apiError("Failed to update alat", error.message, 500);
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await getUser();
        await db.query("DELETE FROM alat WHERE id=$1", [id]);

        if (user) await logAction(user.id, "DELETE_ALAT", id);

        return apiResponse({ message: "Alat berhasil dihapus" });
    } catch (error: any) {
        return apiError("Gagal menghapus alat. Mungkin masih terkait dengan data peminjaman.", error.message, 500);
    }
}
