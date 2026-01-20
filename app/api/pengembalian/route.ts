import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { peminjaman_id } = await req.json();

  await db.query(`
    INSERT INTO pengembalian (peminjaman_id, tanggal_kembali, denda)
    VALUES (
      $1,
      CURRENT_DATE,
      hitung_denda(
        CURRENT_DATE,
        (SELECT tanggal_kembali FROM peminjaman WHERE id=$2)
      )
    )
  `, [peminjaman_id, peminjaman_id]);

  return NextResponse.json({ message: "Alat dikembalikan" });
}
