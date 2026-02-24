import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await db.query(`
      SELECT 
        p.id, 
        a.nama_alat, 
        a.gambar, 
        p.tanggal_pinjam as tgl_pinjam, 
        p.tanggal_kembali as tgl_kembali, 
        p.status
      FROM peminjaman p
      JOIN alat a ON p.alat_id = a.id
      WHERE p.user_id = $1
      ORDER BY p.tanggal_pinjam DESC
    `, [user.id]);

        return NextResponse.json(result.rows.map(row => ({
            ...row,
            status: (row.status || "PENDING").toUpperCase()
        })));
    } catch (error) {
        console.error("User Peminjaman API Error:", error);
        return NextResponse.json({ error: "Gagal mengambil data peminjaman" }, { status: 500 });
    }
}
