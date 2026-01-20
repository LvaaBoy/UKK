import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Pending Approvals (Status: pending)
        const pendingRequestsRes = await db.query("SELECT COUNT(*) FROM peminjaman WHERE status = 'pending'");
        const pendingRequests = parseInt(pendingRequestsRes.rows[0].count);

        // 2. Active Loans (Status: disetujui)
        const activeLoansRes = await db.query("SELECT COUNT(*) FROM peminjaman WHERE status = 'disetujui'");
        const activeLoans = parseInt(activeLoansRes.rows[0].count);

        // 3. Tools Out (Count of tools currently borrowed)
        // Assuming each approval takes 1 tool
        const toolsOutRes = await db.query("SELECT COUNT(*) FROM peminjaman WHERE status = 'disetujui'");
        const toolsOut = parseInt(toolsOutRes.rows[0].count);

        // 4. Activity Chart (Incoming requests per day)
        const activityChartRes = await db.query(`
      SELECT 
        TO_CHAR(tanggal_pinjam, 'Dy') as day,
        COUNT(*) as count
      FROM peminjaman
      WHERE tanggal_pinjam >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY day, tanggal_pinjam
      ORDER BY tanggal_pinjam ASC
    `);

        // 5. Incoming Requests (Top 5 pending)
        const incomingRequestsRes = await db.query(`
      SELECT 
        p.id, 
        u.nama as user, 
        a.nama_alat as item, 
        TO_CHAR(p.tanggal_pinjam, 'DD Mon') as date,
        p.status
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN alat a ON p.alat_id = a.id
      WHERE p.status = 'pending'
      ORDER BY p.tanggal_pinjam DESC
      LIMIT 5
    `);

        // 6. Active Tracking (Latest 5 approved loans)
        const activeTrackingRes = await db.query(`
      SELECT 
        p.id, 
        u.nama as user, 
        a.nama_alat as item, 
        TO_CHAR(p.tanggal_pinjam, 'DD Mon') as date,
        p.status
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN alat a ON p.alat_id = a.id
      WHERE p.status = 'disetujui'
      ORDER BY p.tanggal_pinjam DESC
      LIMIT 5
    `);

        return NextResponse.json({
            stats: {
                pendingRequests: pendingRequests.toLocaleString(),
                activeLoans: activeLoans.toLocaleString(),
                toolsOut: toolsOut.toLocaleString(),
            },
            charts: {
                activity: activityChartRes.rows,
            },
            incomingRequests: incomingRequestsRes.rows.map(row => ({
                ...row,
                id: "#" + row.id,
                status: row.status.toUpperCase()
            })),
            activeTracking: activeTrackingRes.rows.map(row => ({
                ...row,
                id: "#" + row.id,
                status: row.status.toUpperCase()
            }))
        });
    } catch (error) {
        console.error("Petugas Stats API Error:", error);
        return NextResponse.json({ error: "Gagal mengambil data petugas" }, { status: 500 });
    }
}
