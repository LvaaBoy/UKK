import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  console.log("Login attempt for:", username);

  const result = await db.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  const rows = result.rows;

  console.log("User found:", rows.length > 0);

  if (rows.length === 0) {
    console.log("User not found in DB");
    return NextResponse.json(
      { error: "User tidak ditemukan" },
      { status: 401 }
    );
  }

  const user = rows[0];
  let valid = await bcrypt.compare(password, user.password);

  console.log("Password valid (bcrypt):", valid);

  // FALLBACK: Cek apakah password plain text (jika data lama belum di-hash)
  if (!valid && password === user.password) {
    console.log("Fallback: Password matched as plain text. Migrating to hash...");
    valid = true;

    // 🔐 AUTO-MIGRATE: Update password ke bcrypt agar aman ke depannya
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, user.id]);
    console.log("User password migrated to hash.");
  }

  if (!valid) {
    console.log("Invalid password");
    return NextResponse.json(
      { error: "Password salah" },
      { status: 401 }
    );
  }

  // 🔐 GENERATE JWT
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  // ✅ SET COOKIE (INI KUNCINYA)
  const response = NextResponse.json({
    role: user.role,
    nama: user.nama,
    username: user.username
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 hari
    sameSite: "lax",
  });

  return response;
}
