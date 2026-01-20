import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { nama, username, password, role } = await req.json();

  const hash = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO users (nama, username, password, role) VALUES ($1, $2, $3, $4)",
    [nama, username, hash, role]
  );

  return NextResponse.json({ message: "User berhasil dibuat" });
}
