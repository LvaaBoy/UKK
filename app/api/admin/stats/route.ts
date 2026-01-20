import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Total Peminjaman
    const totalPeminjamanRes = await db.query("SELECT COUNT(*) FROM peminjaman");
    const totalPeminjaman = parseInt(totalPeminjamanRes.rows[0].count);

    // 2. Alat Tersedia (Stok > 0)
    const alatTersediaRes = await db.query("SELECT SUM(stok) FROM alat");
    const alatTersedia = parseInt(alatTersediaRes.rows[0].sum || "0");

    // 3. Total Anggota (Users)
    const totalUsersRes = await db.query("SELECT COUNT(*) FROM users");
    const totalUsers = parseInt(totalUsersRes.rows[0].count);

    // 4. Weekly Data (Last 7 days)
    // For simplicity, we'll fetch recent loans/returns and group them in memory
    const weeklyDataRes = await db.query(`
      SELECT 
        TO_CHAR(tanggal_pinjam, 'Dy') as day,
        COUNT(*) as count
      FROM peminjaman
      WHERE tanggal_pinjam >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY day, tanggal_pinjam
      ORDER BY tanggal_pinjam ASC
    `);

    // 5. Category Distribution
    const categoryDistRes = await db.query(`
      SELECT k.nama_kategori as name, COUNT(a.id) as value
      FROM kategori k
      LEFT JOIN alat a ON k.id = a.kategori_id
      GROUP BY k.nama_kategori
    `);

    // 6. Stock Alerts (Stok < 10)
    const stockAlertsRes = await db.query(`
      SELECT id, nama_alat as product, stok as quantity
      FROM alat
      WHERE stok < 10
      LIMIT 5
    `);

    // 7. Recent Activities
    const recentActivitiesRes = await db.query(`
      SELECT 
        p.id, 
        u.nama as user, 
        a.nama_alat as item, 
        TO_CHAR(p.tanggal_pinjam, 'DD Mon YYYY') as date, 
        p.status
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN alat a ON p.alat_id = a.id
      ORDER BY p.tanggal_pinjam DESC
      LIMIT 4
    `);

    return NextResponse.json({
      stats: {
        totalPeminjaman: totalPeminjaman.toLocaleString(),
        alatTersedia: alatTersedia.toLocaleString(),
        totalUsers: totalUsers.toLocaleString(),
      },
      charts: {
        weekly: weeklyDataRes.rows,
        categories: categoryDistRes.rows.map((cat, idx) => ({
          ...cat,
          color: ["#00df82", "#00b368", "#008a50", "#006138", "#004d2c"][idx % 5]
        }))
      },
      stockAlerts: stockAlertsRes.rows.map(row => ({
        ...row,
        id: "#" + row.id,
        alert: 10
      })),
      recentActivities: recentActivitiesRes.rows.map(row => ({
        ...row,
        id: "#" + row.id,
        status: row.status.toUpperCase()
      }))
    });
  } catch (error) {
    console.error("Dashboard Stats API Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data statistik" }, { status: 500 });
  }
}
