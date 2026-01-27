import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-utils";
import { apiResponse, apiError, logAction } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return apiError("Unauthorized", undefined, 401);

    const result = await db.query("SELECT * FROM kategori");
    return apiResponse(result.rows);
  } catch (error: any) {
    console.error("Kategori GET Error:", error);
    return apiError("Internal Server Error", error.message, 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'petugas')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nama_kategori } = await req.json();

    const result = await db.query(
      "INSERT INTO kategori (nama_kategori) VALUES ($1) RETURNING id",
      [nama_kategori]
    );

    await logAction(user.id, "CREATE_KATEGORI", result.rows[0].id.toString(), { name: nama_kategori });

    return apiResponse({ message: "Kategori berhasil ditambahkan" });
  } catch (error: any) {
    console.error("Kategori POST Error:", error);
    return apiError("Internal Server Error", error.message, 500);
  }
}
