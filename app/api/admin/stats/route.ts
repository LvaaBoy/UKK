import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth-utils";
import { apiResponse, apiError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getUser();
    if (!user || (user.role !== "admin" && user.role !== "petugas")) {
      return apiError("Unauthorized", undefined, 401);
    }

    // Run all independent queries in parallel for maximum performance
    const [
      statsRes,
      weeklyStats,
      statusBreakdown,
      popularTools,
      stockRes,
      overdueRes,
      recentRes
    ] = await Promise.all([
      // 1. Fetch Counts & Financials
      db.query(`
        SELECT 
          (SELECT COUNT(*) FROM peminjaman) as total_peminjaman,
          (SELECT SUM(stok) FROM alat) as total_stok,
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COALESCE(SUM(denda), 0) FROM pengembalian) as total_revenue
      `),

      // 2. Weekly Stats - Group by DATE to handle timestamp variations
      db.query(`
        SELECT TO_CHAR(DATE(tanggal_pinjam), 'Dy') as day, 
               COUNT(*) as count, 
               DATE(tanggal_pinjam) as date
        FROM peminjaman
        WHERE tanggal_pinjam >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY 1, 3
        ORDER BY 3 ASC
      `),

      // 3. Status Breakdown
      db.query(`
        SELECT status as name, COUNT(*) as value
        FROM peminjaman
        WHERE status IS NOT NULL
        GROUP BY status
      `),

      // 4. Popular Tools
      db.query(`
        SELECT a.nama_alat as name, COUNT(p.id) as value
        FROM peminjaman p
        JOIN alat a ON p.alat_id = a.id
        GROUP BY a.nama_alat
        ORDER BY value DESC
        LIMIT 5
      `),

      // 5. Stock Alerts
      db.query(`
        SELECT id, nama_alat as product, stok as quantity
        FROM alat
        WHERE stok < 5
        ORDER BY stok ASC
        LIMIT 5
      `),

      // 6. Overdue Items
      db.query(`
        SELECT p.id, u.nama as user, a.nama_alat as item, 
               TO_CHAR(p.tanggal_kembali, 'DD Mon') as deadline,
               (CURRENT_DATE - p.tanggal_kembali) as days_late
        FROM peminjaman p
        JOIN users u ON p.user_id = u.id
        JOIN alat a ON p.alat_id = a.id
        WHERE p.status = 'disetujui' AND p.tanggal_kembali < CURRENT_DATE
        ORDER BY p.tanggal_kembali ASC
        LIMIT 5
      `),

      // 7. Recent Activities
      db.query(`
        SELECT p.id, u.nama as user, a.nama_alat as item, 
               TO_CHAR(p.tanggal_pinjam, 'DD Mon YYYY') as date,
               UPPER(p.status::text) as status
        FROM peminjaman p
        JOIN users u ON p.user_id = u.id
        JOIN alat a ON p.alat_id = a.id
        ORDER BY p.tanggal_pinjam DESC
        LIMIT 10
      `)
    ]);

    const stats = statsRes.rows[0];

    return apiResponse({
      stats: {
        totalPeminjaman: parseInt(stats.total_peminjaman) || 0,
        alatTersedia: parseInt(stats.total_stok) || 0,
        totalUsers: parseInt(stats.total_users) || 0,
        revenue: parseInt(stats.total_revenue) || 0
      },
      charts: {
        weekly: weeklyStats.rows.map((row: any) => ({
          day: row.day,
          count: parseInt(row.count)
        })),
        status: statusBreakdown.rows.map((row: any) => ({
          name: row.name ? row.name.toString().toUpperCase() : 'UNKNOWN',
          value: parseInt(row.value)
        })),
        popular: popularTools.rows.map((row: any) => ({
          name: row.name,
          value: parseInt(row.value)
        }))
      },
      stockAlerts: stockRes.rows,
      overdueItems: overdueRes.rows,
      recentActivities: recentRes.rows
    });

  } catch (error: any) {
    console.error("[ADMIN_STATS_ERROR]", error);
    return apiError("Failed to fetch admin statistics", error.message, 500);
  }
}
