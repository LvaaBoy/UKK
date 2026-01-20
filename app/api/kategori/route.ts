import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db.query("SELECT * FROM kategori");
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { nama_kategori } = await req.json();

  await db.query(
    "INSERT INTO kategori (nama_kategori) VALUES ($1)",
    [nama_kategori]
  );

  return NextResponse.json({ message: "Kategori berhasil ditambahkan" });
}
