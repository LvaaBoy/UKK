"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useTranslation } from "@/app/context/LanguageContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<{ nama: string; role: string; username: string } | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const nama = localStorage.getItem("nama");
    const username = localStorage.getItem("username");
    if (role && nama) {
      setUser({ role, nama, username: username || "" });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) transition-colors duration-300">
      <Sidebar onLogout={handleLogout} role={user?.role} />

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen transition-all duration-300 p-3 md:p-6 lg:p-8">
        <div className="min-h-[calc(100vh-4rem)] p-6 md:p-10 rounded-[40px] md:rounded-[56px] bg-(--surface) border border-(--border) shadow-2xl relative overflow-hidden ring-1 ring-white/5">
          {/* Subtle Background Accent moved inside content */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-(--text-primary)">
                {t("welcome")} {user?.nama || "—"} 👋
              </h2>
              <p className="text-(--text-secondary) text-sm mt-0.5">
                {t("monitoring_desc")}
              </p>
            </div>

            {/* Profile Pill */}
            <div className="hidden md:flex items-center gap-3 bg-(--surface) px-4 py-2 rounded-full border border-(--border) shadow-sm">
              <div className="h-8 w-8 bg-linear-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.nama?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-(--text-primary)">{user?.nama || "User"}</p>
                <p className="text-[10px] text-(--text-secondary) uppercase tracking-wider">
                  {user?.role ? t(`role_${user.role === "peminjam" ? "user" : user.role}` as any) : ""}
                </p>
              </div>
            </div>
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
