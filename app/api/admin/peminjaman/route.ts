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
        p.id,
        p.user_id,
        u.nama AS nama_user,
        p.alat_id,
        a.nama_alat,
        p.tanggal_pinjam,
        p.tanggal_kembali,
        p.status,
        a.stok
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN alat a ON p.alat_id = a.id
      ORDER BY p.tanggal_pinjam DESC
    `);

        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Admin Peminjaman GET Error:", error);
        return NextResponse.json({ error: "Gagal mengambil data peminjaman" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { user_id, alat_id, tanggal_pinjam, tanggal_kembali, status } = await req.json();

        if (!user_id || !alat_id || !tanggal_pinjam || !tanggal_kembali) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        const pinjamStatus = status || "pending";

        const client = await db.connect();
        try {
            await client.query("BEGIN");

            // If directly approved, decrement stock
            if (pinjamStatus === "disetujui") {
                const alatRes = await client.query("SELECT stok FROM alat WHERE id = $1", [alat_id]);
                if (alatRes.rows.length === 0 || alatRes.rows[0].stok < 1) {
                    await client.query("ROLLBACK");
                    return NextResponse.json({ error: "Stok alat tidak mencukupi" }, { status: 400 });
                }
                await client.query("UPDATE alat SET stok = stok - 1 WHERE id = $1", [alat_id]);
            }

            const insertRes = await client.query(
                `INSERT INTO peminjaman (user_id, alat_id, tanggal_pinjam, tanggal_kembali, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [user_id, alat_id, tanggal_pinjam, tanggal_kembali, pinjamStatus]
            );

            await client.query("COMMIT");
            return NextResponse.json({ success: true, id: insertRes.rows[0].id, message: "Peminjaman berhasil ditambahkan" });
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Admin Peminjaman POST Error:", error);
        return NextResponse.json({ error: "Gagal menambahkan peminjaman" }, { status: 500 });
    }
}
