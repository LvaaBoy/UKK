import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { apiResponse, apiError, logAction } from "@/lib/api-utils";
import { getUser } from "@/lib/auth-utils";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { nama_kategori } = await req.json();

  try {
    const user = await getUser();
    await db.query(
      "UPDATE kategori SET nama_kategori=$1 WHERE id=$2",
      [nama_kategori, id]
    );

    if (user) await logAction(user.id, "UPDATE_KATEGORI", id, { name: nama_kategori });

    return apiResponse({ message: "Kategori diupdate" });
  } catch (error: any) {
    return apiError("Failed to update kategori", error.message, 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUser();
    await db.query("DELETE FROM kategori WHERE id=$1", [id]);

    if (user) await logAction(user.id, "DELETE_KATEGORI", id);

    return apiResponse({ message: "Kategori dihapus" });
  } catch (error: any) {
    return apiError("Failed to delete category", error.message, 500);
  }
}
