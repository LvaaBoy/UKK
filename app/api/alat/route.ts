import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";
import { apiResponse, apiError, logAction } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await db.query(`
        SELECT alat.*, kategori.nama_kategori
        FROM alat
        JOIN kategori ON alat.kategori_id = kategori.id
      `);
    return apiResponse(result.rows);
  } catch (error: any) {
    return apiError("Internal Server Error", error.message, 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'petugas')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nama_alat, kategori_id, stok, gambar, deskripsi } = await req.json();

    const result = await db.query(
      "INSERT INTO alat (nama_alat, kategori_id, stok, gambar, deskripsi) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [nama_alat, kategori_id, stok, gambar, deskripsi]
    );

    // Log the action
    await logAction(user.id, "CREATE_ALAT", result.rows[0].id.toString(), { name: nama_alat, stock: stok, image: !!gambar });

    return apiResponse({ message: "Alat ditambahkan" });
  } catch (error: any) {
    console.error("Alat API Error:", error);
    return apiError("Internal Server Error", error.message, 500);
  }
}
