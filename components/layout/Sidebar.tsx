"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    ClipboardList,
    LogOut,
    Menu,
    X,
    Shield,
    Settings as SettingsIcon
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin", roles: ["admin"] },
    { label: "Dashboard", icon: LayoutDashboard, path: "/petugas", roles: ["petugas"] },
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["peminjam", "user"] },
    { label: "Data Alat", icon: Package, path: "/admin/alat", roles: ["admin", "petugas"] },
    { label: "Katalog Alat", icon: Package, path: "/dashboard/alat", roles: ["peminjam", "user"] },
    { label: "Kategori", icon: ClipboardList, path: "/admin/kategori", roles: ["admin", "petugas"] },
    { label: "Peminjaman", icon: ClipboardList, path: "/dashboard/peminjaman", roles: ["peminjam", "user"] },
    { label: "Users", icon: Users, path: "/admin/users", roles: ["admin"] },
    { label: "Audit Logs", icon: Shield, path: "/admin/audit-logs", roles: ["admin"] },
    { label: "Laporan", icon: FileText, path: "/admin/laporan", roles: ["admin"] },
];

interface SidebarProps {
    onLogout: () => void;
    className?: string;
    role?: string;
}

export function Sidebar({ onLogout, className, role = "user" }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const filteredItems = menuItems.filter(item => item.roles.includes(role));

    return (
        <>
            {/* Mobile Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden bg-white/50 backdrop-blur"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 transform bg-white/80 backdrop-blur-xl border-r border-white/40 transition-transform duration-300 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    className
                )}
            >
                <div className="flex flex-col h-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="h-10 w-10 bg-linear-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mr-3">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600">
                            {role === 'petugas' ? 'PetugasPanel' : role === 'admin' ? 'AdminPanel' : 'UserPanel'}
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {filteredItems.map((item) => {
                            const Icon = item.icon;
                            // Check active state more loosely for sub-routes if needed, but strict for now
                            const isActive = pathname === item.path;

                            return (
                                <Link key={item.path} href={item.path}>
                                    <div
                                        className={cn(
                                            "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                                            isActive
                                                ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                        onClick={() => setIsOpen(false)} // Close on mobile click
                                    >
                                        <Icon className={cn("h-5 w-5 mr-3 transition-colors", isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600")} />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={onLogout}
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}

