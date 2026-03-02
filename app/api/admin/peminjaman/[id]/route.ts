import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { user_id, alat_id, tanggal_pinjam, tanggal_kembali, status } = await req.json();

        if (!status) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        // Get current loan
        const currentRes = await db.query("SELECT * FROM peminjaman WHERE id = $1", [id]);
        if (currentRes.rows.length === 0) {
            return NextResponse.json({ error: "Peminjaman tidak ditemukan" }, { status: 404 });
        }
        const current = currentRes.rows[0];

        const client = await db.connect();
        try {
            await client.query("BEGIN");

            const prevStatus = current.status.toLowerCase().trim();
            const newStatus = status.toLowerCase().trim();

            // If approving (pending → disetujui), decrement stock
            if (prevStatus === "pending" && newStatus === "disetujui") {
                const alatId = alat_id || current.alat_id;
                const alatRes = await client.query("SELECT stok FROM alat WHERE id = $1", [alatId]);
                if (alatRes.rows.length === 0 || alatRes.rows[0].stok < 1) {
                    await client.query("ROLLBACK");
                    return NextResponse.json({ error: "Stok alat tidak mencukupi" }, { status: 400 });
                }
                await client.query("UPDATE alat SET stok = stok - 1 WHERE id = $1", [alatId]);
            }

            // If reverting from approved to pending/rejected, increment stock back
            if (prevStatus === "disetujui" && (newStatus === "pending" || newStatus === "ditolak")) {
                await client.query("UPDATE alat SET stok = stok + 1 WHERE id = $1", [current.alat_id]);
            }

            await client.query(
                `UPDATE peminjaman SET 
          user_id = COALESCE($1, user_id),
          alat_id = COALESCE($2, alat_id),
          tanggal_pinjam = COALESCE($3, tanggal_pinjam),
          tanggal_kembali = COALESCE($4, tanggal_kembali),
          status = $5
         WHERE id = $6`,
                [user_id || null, alat_id || null, tanggal_pinjam || null, tanggal_kembali || null, status, id]
            );

            await client.query("COMMIT");
            return NextResponse.json({ success: true, message: "Peminjaman berhasil diperbarui" });
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Admin Peminjaman PUT Error:", error);
        return NextResponse.json({ error: "Gagal memperbarui peminjaman" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const loanRes = await db.query("SELECT * FROM peminjaman WHERE id = $1", [id]);
        if (loanRes.rows.length === 0) {
            return NextResponse.json({ error: "Peminjaman tidak ditemukan" }, { status: 404 });
        }

        const loan = loanRes.rows[0];
        const client = await db.connect();
        try {
            await client.query("BEGIN");

            // Delete related pengembalian first
            await client.query("DELETE FROM pengembalian WHERE peminjaman_id = $1", [id]);

            // If was approved, restore stock
            if (loan.status.toLowerCase() === "disetujui") {
                await client.query("UPDATE alat SET stok = stok + 1 WHERE id = $1", [loan.alat_id]);
            }

            await client.query("DELETE FROM peminjaman WHERE id = $1", [id]);

            await client.query("COMMIT");
            return NextResponse.json({ success: true, message: "Peminjaman berhasil dihapus" });
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Admin Peminjaman DELETE Error:", error);
        return NextResponse.json({ error: "Gagal menghapus peminjaman" }, { status: 500 });
    }
}
