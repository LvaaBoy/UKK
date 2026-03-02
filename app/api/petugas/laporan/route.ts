import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";

export async function GET() {
    try {
        const user = await getUser();
        if (!user || (user.role !== "petugas" && user.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Summary stats
        const totalRes = await db.query("SELECT COUNT(*) FROM peminjaman");
        const pendingRes = await db.query("SELECT COUNT(*) FROM peminjaman WHERE status = 'pending'");
        const activeRes = await db.query("SELECT COUNT(*) FROM peminjaman WHERE status = 'disetujui'");
        const returnedRes = await db.query("SELECT COUNT(*) FROM peminjaman WHERE status = 'kembali'");
        const dendaRes = await db.query("SELECT COALESCE(SUM(denda), 0) AS total_denda FROM pengembalian");

        // All transactions (peminjaman + pengembalian join)
        const detailRes = await db.query(`
      SELECT 
        p.id,
        u.nama AS nama_user,
        a.nama_alat,
        p.tanggal_pinjam,
        p.tanggal_kembali AS rencana_kembali,
        p.status,
        pg.tanggal_kembali AS aktual_kembali,
        pg.denda
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN alat a ON p.alat_id = a.id
      LEFT JOIN pengembalian pg ON pg.peminjaman_id = p.id
      ORDER BY p.tanggal_pinjam DESC
    `);

        return NextResponse.json({
            success: true,
            stats: {
                total: parseInt(totalRes.rows[0].count),
                pending: parseInt(pendingRes.rows[0].count),
                active: parseInt(activeRes.rows[0].count),
                returned: parseInt(returnedRes.rows[0].count),
                totalDenda: parseInt(dendaRes.rows[0].total_denda),
            },
            data: detailRes.rows,
        });
    } catch (error) {
        console.error("Petugas Laporan GET Error:", error);
        return NextResponse.json({ error: "Gagal mengambil data laporan" }, { status: 500 });
    }
}
