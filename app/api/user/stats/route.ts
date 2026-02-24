import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Stats for this user
    const statsRes = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'disetujui') as active,
        COUNT(*) as total
      FROM peminjaman 
      WHERE user_id = $1
    `, [user.id]);

    const stats = statsRes.rows[0];

    // 2. Recent Activities for this user
    const recentRes = await db.query(`
      SELECT 
        p.id, 
        a.nama_alat as item, 
        a.gambar, 
        p.tanggal_pinjam as date, 
        p.status
      FROM peminjaman p
      JOIN alat a ON p.alat_id = a.id
      WHERE p.user_id = $1
      ORDER BY p.tanggal_pinjam DESC
      LIMIT 4
    `, [user.id]);

    // 3. Recommended / Available Tools (Simple random for now)
    const toolsRes = await db.query(`
      SELECT id, nama_alat as name, stok as quantity
      FROM alat
      WHERE stok > 0
      ORDER BY RANDOM()
      LIMIT 3
    `);

    return NextResponse.json({
      stats: {
        pendingRequests: Number(stats.pending || 0).toLocaleString(),
        activeLoans: Number(stats.active || 0).toLocaleString(),
        totalLoans: Number(stats.total || 0).toLocaleString(),
      },
      recentActivities: recentRes.rows.map(row => ({
        ...row,
        id: "#" + row.id,
        status: (row.status || "PENDING").toUpperCase()
      })),
      recommendedTools: toolsRes.rows
    });
  } catch (error) {
    console.error("User Stats API Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}
