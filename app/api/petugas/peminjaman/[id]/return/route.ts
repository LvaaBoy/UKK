import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user || (user.role !== 'petugas' && user.role !== 'admin')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // 1. Check if the peminjaman exists
        const loanRes = await db.query(
            "SELECT * FROM peminjaman WHERE id = $1",
            [id]
        );

        if (loanRes.rows.length === 0) {
            return NextResponse.json({ error: "Peminjaman tidak ditemukan" }, { status: 404 });
        }

        const loan = loanRes.rows[0];
        const status = loan.status.toLowerCase().trim();

        console.log(`[RETURN_DEBUG] ID: ${id}, Current Status: "${status}"`);

        // Allow 'disetujui' or 'pending_kembali'
        if (status !== 'disetujui' && status !== 'pending_kembali') {
            console.log(`[RETURN_DEBUG] Invalid Status for Return: "${status}"`);
            return NextResponse.json({
                error: `Status peminjaman ("${status}") tidak valid untuk dikembalikan. Status harus "disetujui" atau "pending_kembali".`
            }, { status: 400 });
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 2. Update peminjaman status
            await client.query(
                "UPDATE peminjaman SET status = 'kembali' WHERE id = $1",
                [id]
            );

            // 3. Insert into pengembalian table
            // We use a simple COALESCE/CASE for denda if hitung_denda function isn't perfectly mapped in SQL, 
            // but the snippet showed hitung_denda exists in DB.
            await client.query(`
                INSERT INTO pengembalian (peminjaman_id, tanggal_kembali, denda)
                VALUES ($1, CURRENT_DATE, 
                    CASE 
                        WHEN CURRENT_DATE > (SELECT tanggal_kembali FROM peminjaman WHERE id = $2) 
                        THEN (CURRENT_DATE - (SELECT tanggal_kembali FROM peminjaman WHERE id = $2)) * 5000 
                        ELSE 0 
                    END
                )
            `, [id, id]);

            // 4. Increment tool stock
            await client.query(
                "UPDATE alat SET stok = stok + 1 WHERE id = $1",
                [loan.alat_id]
            );

            await client.query('COMMIT');
            return NextResponse.json({ message: "Berhasil mengkonfirmasi pengembalian alat" });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Petugas Return API Error:", error);
        return NextResponse.json({ error: "Gagal memproses pengembalian" }, { status: 500 });
    }
}
