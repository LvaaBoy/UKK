"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ nama: string; role: string; username: string } | null>(null);

  useEffect(() => {
    // Check local storage for user data
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
      localStorage.removeItem("user");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar onLogout={handleLogout} role={user?.role} />

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen transition-all duration-300">
        <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto">
          {/* Header/Greeting */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-800 to-gray-600">
                Welcome back, {user?.nama || "Admin"} 👋
              </h2>
              <p className="text-gray-500 text-sm">Here's what's happening today.</p>
            </div>

            {/* Profile Avatar (Placeholder) */}
            <div className="hidden md:flex items-center space-x-3 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {user?.nama?.[0] || "A"}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.role || "Admin"}</span>
            </div>
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
