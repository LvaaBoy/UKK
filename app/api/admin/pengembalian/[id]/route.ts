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
        const { tanggal_kembali, denda } = await req.json();

        if (!tanggal_kembali) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        const pengembalianRes = await db.query("SELECT * FROM pengembalian WHERE id = $1", [id]);
        if (pengembalianRes.rows.length === 0) {
            return NextResponse.json({ error: "Pengembalian tidak ditemukan" }, { status: 404 });
        }

        await db.query(
            `UPDATE pengembalian SET tanggal_kembali = $1, denda = $2 WHERE id = $3`,
            [tanggal_kembali, denda ?? 0, id]
        );

        return NextResponse.json({ success: true, message: "Pengembalian berhasil diperbarui" });
    } catch (error) {
        console.error("Admin Pengembalian PUT Error:", error);
        return NextResponse.json({ error: "Gagal memperbarui pengembalian" }, { status: 500 });
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

        const pgRes = await db.query(
            "SELECT pg.*, p.alat_id FROM pengembalian pg JOIN peminjaman p ON pg.peminjaman_id = p.id WHERE pg.id = $1",
            [id]
        );
        if (pgRes.rows.length === 0) {
            return NextResponse.json({ error: "Pengembalian tidak ditemukan" }, { status: 404 });
        }

        const pg = pgRes.rows[0];
        const client = await db.connect();
        try {
            await client.query("BEGIN");

            // Delete pengembalian
            await client.query("DELETE FROM pengembalian WHERE id = $1", [id]);

            // Revert peminjaman status back to disetujui
            await client.query(
                "UPDATE peminjaman SET status = 'disetujui' WHERE id = $1",
                [pg.peminjaman_id]
            );

            // Decrement stock back (tool is again out)
            await client.query("UPDATE alat SET stok = stok - 1 WHERE id = $1", [pg.alat_id]);

            await client.query("COMMIT");
            return NextResponse.json({ success: true, message: "Pengembalian berhasil dihapus" });
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Admin Pengembalian DELETE Error:", error);
        return NextResponse.json({ error: "Gagal menghapus pengembalian" }, { status: 500 });
    }
}
