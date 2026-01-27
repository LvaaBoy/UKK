import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // 1. Check if the peminjaman belongs to the user and is DISETUJUI
        const loanRes = await db.query(
            "SELECT * FROM peminjaman WHERE id = $1 AND user_id = $2",
            [id, user.id]
        );

        if (loanRes.rows.length === 0) {
            return NextResponse.json({ error: "Peminjaman tidak ditemukan" }, { status: 404 });
        }

        const loan = loanRes.rows[0];
        if (loan.status.toLowerCase() !== 'disetujui') {
            return NextResponse.json({ error: "Hanya peminjaman yang disetujui yang dapat dikembalikan" }, { status: 400 });
        }

        // 2. Request Return (Set status to pending_kembali) - NO STOCK UPDATE YET
        await db.query(
            "UPDATE peminjaman SET status = 'pending_kembali' WHERE id = $1",
            [id]
        );

        return NextResponse.json({ message: "Pengajuan pengembalian berhasil. Tunggu konfirmasi petugas." });

    } catch (error) {
        console.error("Return API Error:", error);
        return NextResponse.json({ error: "Gagal memproses pengembalian" }, { status: 500 });
    }
}
