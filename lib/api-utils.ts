import { NextResponse } from "next/server";
import { db } from "./db";

export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    detail?: string;
};

/**
 * Standard utility for consistent API responses
 */
export function apiResponse<T>(data: T, status: number = 200) {
    return NextResponse.json(
        {
            success: true,
            data,
        },
        { status }
    );
}

/**
 * Standard utility for consistent API errors
 */
export function apiError(message: string, detail?: string, status: number = 400) {
    return NextResponse.json(
        {
            success: false,
            error: message,
            detail,
        },
        { status }
    );
}

/**
 * Logs an administrative action to the audit_logs table
 */
export async function logAction(
    userId: number | null,
    action: string,
    targetId?: string,
    details?: any
) {
    try {
        await db.query(
            "INSERT INTO audit_logs (user_id, action, target_id, details) VALUES ($1, $2, $3, $4)",
            [userId, action, targetId, details ? JSON.stringify(details) : null]
        );
        return true;
    } catch (error) {
        console.error("[LOG_ACTION_ERROR]", error);
        return false;
    }
}
