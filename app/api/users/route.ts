import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await db.query("SELECT id, nama, username, role, created_at FROM users ORDER BY created_at DESC");
        return NextResponse.json(result.rows);
    } catch {
        return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
    }
}
