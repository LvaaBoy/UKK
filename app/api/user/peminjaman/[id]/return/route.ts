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

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 2. Update peminjaman status and return date
            await client.query(
                "UPDATE peminjaman SET status = 'kembali', tanggal_kembali = CURRENT_DATE WHERE id = $1",
                [id]
            );

            // 3. Increment tool stock
            await client.query(
                "UPDATE alat SET stok = stok + 1 WHERE id = $1",
                [loan.alat_id]
            );

            await client.query('COMMIT');
            return NextResponse.json({ message: "Berhasil mengembalikan alat" });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Return API Error:", error);
        return NextResponse.json({ error: "Gagal memproses pengembalian" }, { status: 500 });
    }
}
