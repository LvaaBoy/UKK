import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { alat_id, tanggal_kembali } = await req.json();

    if (!alat_id || !tanggal_kembali) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    await db.query(
      `INSERT INTO peminjaman 
       (user_id, alat_id, tanggal_pinjam, tanggal_kembali, status)
       VALUES ($1, $2, CURRENT_DATE, $3, 'pending')`,
      [user.id, alat_id, tanggal_kembali]
    );

    return NextResponse.json({ message: "Peminjaman diajukan" });
  } catch (error) {
    console.error("Peminjaman API Error:", error);
    return NextResponse.json({ error: "Gagal mengajukan peminjaman" }, { status: 500 });
  }
}

export async function GET() {
  const result = await db.query(`
    SELECT p.*, u.nama, a.nama_alat
    FROM peminjaman p
    JOIN users u ON p.user_id = u.id
    JOIN alat a ON p.alat_id = a.id
  `);

  return NextResponse.json(result.rows);
}
