import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user || (user.role !== 'admin' && user.role !== 'petugas')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Get loan details to find alat_id
    const loanRes = await client.query("SELECT * FROM peminjaman WHERE id = $1", [id]);
    if (loanRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: "Peminjaman not found" }, { status: 404 });
    }
    const loan = loanRes.rows[0];

    // 2. Check stock
    const alatRes = await client.query("SELECT stok FROM alat WHERE id = $1", [loan.alat_id]);
    if (alatRes.rows.length === 0 || alatRes.rows[0].stok < 1) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: "Stok habis, tidak dapat menyetujui" }, { status: 400 });
    }

    // 3. Decrement Stock
    await client.query("UPDATE alat SET stok = stok - 1 WHERE id = $1", [loan.alat_id]);

    // 4. Update Status
    await client.query("UPDATE peminjaman SET status='disetujui' WHERE id=$1", [id]);

    await client.query('COMMIT');
    return NextResponse.json({ message: "Peminjaman disetujui" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
}
