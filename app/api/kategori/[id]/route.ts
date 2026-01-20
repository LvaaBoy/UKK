import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { nama_kategori } = await req.json();

  await db.query(
    "UPDATE kategori SET nama_kategori=$1 WHERE id=$2",
    [nama_kategori, id]
  );

  return NextResponse.json({ message: "Kategori diupdate" });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.query("DELETE FROM kategori WHERE id=$1", [id]);
  return NextResponse.json({ message: "Kategori dihapus" });
}
