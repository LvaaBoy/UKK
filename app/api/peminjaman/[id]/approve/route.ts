import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.query(
    "UPDATE peminjaman SET status='disetujui' WHERE id=$1",
    [id]
  );

  return NextResponse.json({ message: "Peminjaman disetujui" });
}
