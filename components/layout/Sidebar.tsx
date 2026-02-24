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
    Sun,
    Moon,
    ChevronDown,
    Globe,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { useTranslation } from "@/app/context/LanguageContext";
import { Language } from "@/locales";

interface SidebarProps {
    onLogout: () => void;
    className?: string;
    role?: string;
}

export function Sidebar({ onLogout, className, role = "user" }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { t, language, setLanguage, languageMeta } = useTranslation();
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close sidebar when route changes (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const menuItems = [
        { labelKey: "dashboard" as const, icon: LayoutDashboard, path: "/admin", roles: ["admin"] },
        { labelKey: "dashboard" as const, icon: LayoutDashboard, path: "/petugas", roles: ["petugas"] },
        { labelKey: "dashboard" as const, icon: LayoutDashboard, path: "/dashboard", roles: ["peminjam", "user"] },
        { labelKey: "products" as const, icon: Package, path: "/admin/alat", roles: ["admin", "petugas"] },
        { labelKey: "products" as const, icon: Package, path: "/dashboard/alat", roles: ["peminjam", "user"] },
        { labelKey: "categories" as const, icon: ClipboardList, path: "/admin/kategori", roles: ["admin", "petugas"] },
        { labelKey: "loans" as const, icon: ClipboardList, path: "/dashboard/peminjaman", roles: ["peminjam", "user"] },
        { labelKey: "users" as const, icon: Users, path: "/admin/users", roles: ["admin"] },
        { labelKey: "reports" as const, icon: FileText, path: "/admin/laporan", roles: ["admin"] },
        { labelKey: "stats" as const, icon: Shield, path: "/admin/audit-logs", roles: ["admin"] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(role));
    const panelTitle = role === "petugas" ? "Petugas Panel" : role === "admin" ? "Admin Panel" : "User Panel";
    const isDark = theme === "dark";

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-(--surface) border border-(--border) shadow-lg backdrop-blur-sm"
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="Toggle menu"
            >
                {isOpen
                    ? <X className="h-5 w-5 text-(--text-primary)" />
                    : <Menu className="h-5 w-5 text-(--text-primary)" />
                }
            </button>

            {/* Sidebar Panel */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-all duration-300 ease-in-out",
                    "bg-(--sidebar-bg) backdrop-blur-xl border-r border-(--sidebar-border)",
                    "md:m-3 md:rounded-[32px] md:border md:shadow-2xl",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    className
                )}
            >
                {/* Logo Header */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-(--border)">
                    <div className="h-9 w-9 shrink-0 bg-linear-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Package className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-bold text-(--text-primary) truncate">
                            {t(`panel_${role === "peminjam" ? "user" : role}` as any)}
                        </h1>
                        <p className="text-[10px] text-(--text-muted) uppercase tracking-wider font-medium">
                            {t(`role_${role === "peminjam" ? "user" : role}` as any)}
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.path} href={item.path}>
                                <div
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer group",
                                        isActive
                                            ? "bg-(--sidebar-item-active) text-(--sidebar-item-active-text) shadow-sm"
                                            : "text-(--sidebar-text) hover:bg-(--sidebar-item-hover) hover:text-(--text-primary)"
                                    )}
                                >
                                    <Icon className={cn(
                                        "h-[18px] w-[18px] shrink-0 transition-colors",
                                        isActive
                                            ? "text-(--sidebar-item-active-text)"
                                            : "text-(--text-muted) group-hover:text-(--text-secondary)"
                                    )} />
                                    <span className="text-sm font-medium truncate flex-1">{t(item.labelKey)}</span>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-(--border) space-y-1">

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-(--sidebar-text) hover:bg-(--sidebar-item-hover) hover:text-(--text-primary) transition-all duration-150 group"
                        aria-label="Toggle theme"
                    >
                        {isDark
                            ? <Sun className="h-[18px] w-[18px] shrink-0 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                            : <Moon className="h-[18px] w-[18px] shrink-0 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
                        }
                        <span className="text-sm font-medium flex-1 text-left">
                            {isDark ? t("theme_light") : t("theme_dark")}
                        </span>
                        {/* Toggle pill with premium look */}
                        <div className={cn(
                            "w-10 h-6 rounded-full relative transition-all duration-300 shrink-0 border border-(--border) shadow-inner",
                            isDark ? "bg-blue-600/20" : "bg-slate-200/50"
                        )}>
                            <div className={cn(
                                "absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full shadow-lg transition-transform duration-500 flex items-center justify-center",
                                isDark
                                    ? "translate-x-4 bg-blue-500 shadow-blue-500/40"
                                    : "translate-x-0 bg-white"
                            )}>
                                {isDark ? <Sun size={8} className="text-white" /> : <Moon size={8} className="text-slate-400" />}
                            </div>
                        </div>
                    </button>

                    {/* Language Switcher */}
                    <div ref={langRef} className="relative">
                        <button
                            onClick={() => setLangOpen(v => !v)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-(--sidebar-text) hover:bg-(--sidebar-item-hover) hover:text-(--text-primary) transition-all duration-150"
                        >
                            <Globe className="h-[18px] w-[18px] shrink-0 text-emerald-400" />
                            <span className="text-sm font-medium flex-1 text-left">
                                {languageMeta[language].flag} {languageMeta[language].nativeName}
                            </span>
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200 shrink-0", langOpen && "rotate-180")} />
                        </button>

                        {langOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl overflow-hidden bg-(--surface) border border-(--border) shadow-2xl z-10">
                                {(Object.entries(languageMeta) as [Language, (typeof languageMeta)[Language]][]).map(([code, meta]) => (
                                    <button
                                        key={code}
                                        onClick={() => { setLanguage(code); setLangOpen(false); }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                                            language === code
                                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                                                : "text-(--text-secondary) hover:bg-(--surface-secondary)"
                                        )}
                                    >
                                        <span className="text-base">{meta.flag}</span>
                                        <span className="flex-1">{meta.nativeName}</span>
                                        {language === code && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all duration-150 group"
                    >
                        <LogOut className="h-[18px] w-[18px] shrink-0 group-hover:-translate-x-0.5 transition-transform duration-150" />
                        <span className="text-sm font-medium">{t("logout")}</span>
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
