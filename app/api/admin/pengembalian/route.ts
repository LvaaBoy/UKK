import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";

export async function GET() {
    try {
        const user = await getUser();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await db.query(`
      SELECT 
        pg.id,
        pg.peminjaman_id,
        pg.tanggal_kembali,
        pg.denda,
        u.nama AS nama_user,
        a.nama_alat,
        p.tanggal_pinjam,
        p.tanggal_kembali AS tanggal_kembali_rencana,
        p.status AS status_peminjaman
      FROM pengembalian pg
      JOIN peminjaman p ON pg.peminjaman_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN alat a ON p.alat_id = a.id
      ORDER BY pg.tanggal_kembali DESC
    `);

        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Admin Pengembalian GET Error:", error);
        return NextResponse.json({ error: "Gagal mengambil data pengembalian" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { peminjaman_id, tanggal_kembali, denda } = await req.json();

        if (!peminjaman_id || !tanggal_kembali) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        // Check peminjaman exists and is in valid status
        const loanRes = await db.query("SELECT * FROM peminjaman WHERE id = $1", [peminjaman_id]);
        if (loanRes.rows.length === 0) {
            return NextResponse.json({ error: "Data peminjaman tidak ditemukan" }, { status: 404 });
        }

        const loan = loanRes.rows[0];
        const status = loan.status.toLowerCase().trim();
        if (status !== "disetujui" && status !== "pending_kembali") {
            return NextResponse.json({
                error: `Status peminjaman "${status}" tidak valid untuk pengembalian`
            }, { status: 400 });
        }

        const client = await db.connect();
        try {
            await client.query("BEGIN");

            // Calculate denda if not provided
            const dendaFinal = denda !== undefined ? denda :
                (new Date(tanggal_kembali) > new Date(loan.tanggal_kembali)
                    ? Math.floor((new Date(tanggal_kembali).getTime() - new Date(loan.tanggal_kembali).getTime()) / (1000 * 60 * 60 * 24)) * 5000
                    : 0);

            // Insert pengembalian
            const insertRes = await client.query(
                `INSERT INTO pengembalian (peminjaman_id, tanggal_kembali, denda) VALUES ($1, $2, $3) RETURNING id`,
                [peminjaman_id, tanggal_kembali, dendaFinal]
            );

            // Update peminjaman status to kembali
            await client.query("UPDATE peminjaman SET status = 'kembali' WHERE id = $1", [peminjaman_id]);

            // Increment tool stock
            await client.query("UPDATE alat SET stok = stok + 1 WHERE id = $1", [loan.alat_id]);

            await client.query("COMMIT");
            return NextResponse.json({
                success: true,
                id: insertRes.rows[0].id,
                message: "Pengembalian berhasil ditambahkan"
            });
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Admin Pengembalian POST Error:", error);
        return NextResponse.json({ error: "Gagal menambahkan pengembalian" }, { status: 500 });
    }
}
