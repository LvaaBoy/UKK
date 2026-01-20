"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings as SettingsIcon,
  Users,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  Wrench,
  ChevronDown,
  User as UserIcon,
  Shield,
  Palette,
  ClipboardList
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "../context/LanguageContext";
import { Language, TranslationKeys } from "@/lib/translations";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Products", icon: Package, path: "/admin/alat" },
  { label: "Categories", icon: ClipboardList, path: "/admin/kategori" },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Reports", icon: FileText, path: "/admin/laporan" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState("User");
  const [userRole, setUserRole] = useState("");
  const [userIdentifier, setUserIdentifier] = useState("");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin" && role !== "petugas" && role !== "peminjam") {
      router.push("/login");
    }
    setUserRole(role || "");

    const name = localStorage.getItem("nama");
    const username = localStorage.getItem("username");

    if (name) setAdminName(name);
    if (username) setUserIdentifier(username);
  }, [router]);

  const sidebarItems = SIDEBAR_ITEMS.filter(item => {
    if (userRole === "petugas") {
      return ["Dashboard", "Products", "Categories"].includes(item.label);
    }
    if (userRole === "peminjam") {
      return ["Dashboard", "Products"].includes(item.label);
    }
    return true;
  }).map(item => {
    let path = item.path;
    let labelKey = item.label.toLowerCase().replace(" ", "_") as TranslationKeys;

    if (userRole === "petugas" && item.label === "Dashboard") path = "/petugas";
    if (userRole === "peminjam") {
      if (item.label === "Dashboard") path = "/dashboard";
      if (item.label === "Products") path = "/dashboard/alat";
    }

    return { ...item, path, label: t(labelKey) };
  });

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'id', label: 'Bahasa', flag: '🇮🇩' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'jp', label: '日本語', flag: '🇯🇵' },
  ];

  return (
    <div className="flex h-screen bg-brand-sky text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm z-50 lg:hidden transition-all duration-500"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 lg:relative z-50 flex flex-col transition-all duration-500 border-r border-blue-100 
          ${isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
          ${isSidebarOpen ? "lg:w-64" : "lg:w-20"}
          bg-white/80 backdrop-blur-xl
        `}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Wrench size={20} />
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold text-xl tracking-tight text-blue-900">Alat<span className="text-pink-500">Pro</span></span>}
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-blue-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto space-y-8 mt-4 scrollbar-hide">
          <div>
            {(isSidebarOpen || isMobileMenuOpen) && <p className="text-[10px] font-black text-blue-300 tracking-[0.2em] uppercase px-2 mb-4">{t('management')}</p>}
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        router.push(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 ${isActive
                        ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
                        : "text-slate-500 hover:bg-blue-50/50 hover:text-blue-600"
                        }`}
                    >
                      <item.icon size={20} className={isActive ? "text-blue-500" : "text-slate-400"} />
                      {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            {(isSidebarOpen || isMobileMenuOpen) && <p className="text-[10px] font-black text-pink-300 tracking-[0.2em] uppercase px-2 mb-4">{t('settings')}</p>}
            <ul className="space-y-1">
              <li>
                <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-all duration-300">
                  <SettingsIcon size={20} className="text-slate-400" />
                  {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm">{t('settings')}</span>}
                </button>
              </li>
              <li>
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 mt-4">
                  <LogOut size={20} />
                  {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm font-bold">{t('logout')}</span>}
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-blue-50">
          <div className={`p-2 rounded-2xl flex items-center bg-gradient-to-r from-blue-50 to-pink-50/30 ${(isSidebarOpen || isMobileMenuOpen) ? "gap-3" : "justify-center"}`}>
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 font-bold shrink-0 uppercase border border-blue-100">
              {adminName.charAt(0)}
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="overflow-hidden text-left">
                <p className="text-sm font-bold text-blue-900 truncate">{adminName}</p>
                <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">
                  {userRole === 'admin' ? t('management') : userRole === 'petugas' ? 'Petugas' : 'User'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-blue-50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.innerWidth < 1024 ? setIsMobileMenuOpen(true) : setSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl hover:bg-blue-50 text-blue-400 transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg lg:text-xl font-black text-blue-900">
              {t('welcome')} ✨
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-blue-100 hover:border-blue-300 transition-all font-bold text-xs"
              >
                <span>{languages.find(l => l.code === language)?.flag}</span>
                <span className="hidden md:inline uppercase tracking-widest">{language}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${showLanguageMenu ? 'rotate-180' : ''}`} />
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-42 bg-white rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-50 overflow-hidden z-50">
                  <div className="p-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setShowLanguageMenu(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${language === lang.code ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-blue-100 text-blue-400 hover:text-pink-500 transition-colors shadow-sm active:scale-95">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-hide">
          {children}
        </section>

        {showSettings && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-blue-50 overflow-hidden">
              <div className="p-6 flex items-center justify-between border-b border-blue-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><SettingsIcon size={20} /></div>
                  <h3 className="font-bold text-lg text-blue-900">{t('settings')}</h3>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-blue-50 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-4"><Palette className="text-pink-500" size={18} /><h4 className="font-bold text-sm">Appearance</h4></div>
                  <p className="text-xs text-slate-500">Theme is managed by the system in Blue-Pink palette.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-4"><Shield className="text-blue-500" size={18} /><h4 className="font-bold text-sm">Account Security</h4></div>
                  <button className="w-full py-3 bg-white border border-blue-100 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all">Update Credentials</button>
                </div>
                <button onClick={logout} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all">Logout Session</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
