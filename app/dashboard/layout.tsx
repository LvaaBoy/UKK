"use client";
import AdminLayout from "../admin/layout";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return <AdminLayout>{children}</AdminLayout>;
}
