import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db.query(`
    SELECT alat.*, kategori.nama_kategori
    FROM alat
    JOIN kategori ON alat.kategori_id = kategori.id
  `);
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { nama_alat, kategori_id, stok } = await req.json();

  await db.query(
    "INSERT INTO alat (nama_alat, kategori_id, stok) VALUES ($1, $2, $3)",
    [nama_alat, kategori_id, stok]
  );

  return NextResponse.json({ message: "Alat ditambahkan" });
}
