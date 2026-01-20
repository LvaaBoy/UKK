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
  Sun,
  Moon,
  Search,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Wrench,
  Hammer,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  Shield,
  Palette
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState("User");
  const [userRole, setUserRole] = useState("");
  const [userIdentifier, setUserIdentifier] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
      // Petugas only sees Dashboard, Products, and Categories (for operational lookups)
      return ["Dashboard", "Products", "Categories"].includes(item.label);
    }
    if (userRole === "peminjam") {
      // Peminjam only sees Dashboard and Products (to browse)
      return ["Dashboard", "Products"].includes(item.label);
    }
    return true; // Admin sees all
  }).map(item => ({
    ...item,
    path: userRole === "petugas" && item.label === "Dashboard" ? "/petugas" :
      userRole === "peminjam" ? (item.label === "Dashboard" ? "/dashboard" : (item.label === "Products" ? "/dashboard/alat" : item.path)) : item.path
  }));

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className={`flex h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-(--background) text-white' : 'bg-[#f8fafc] text-slate-800'}`}>
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"}
          ${theme === 'dark' ? 'bg-(--card-bg) border-(--border-color)' : 'bg-white border-slate-200'}
          border-r flex flex-col transition-all duration-300 z-50`}
      >
        {/* Sidebar Header / Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-black shadow-lg shadow-emerald-100/10">
            <Wrench size={20} />
          </div>
          {isSidebarOpen && <span className={`font-bold text-xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>PeminjamanAlat</span>}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto space-y-8 mt-4">
          <div>
            {isSidebarOpen && <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase px-2 mb-4">Main Menu</p>}
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                        ? "bg-brand-green/10 text-brand-green font-semibold"
                        : theme === 'dark' ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <item.icon size={20} className={isActive ? "text-brand-green" : "text-slate-400"} />
                      {isSidebarOpen && <span>{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            {isSidebarOpen && <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase px-2 mb-4">System</p>}
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setShowSettings(true)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${theme === 'dark' ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <SettingsIcon size={20} className="text-slate-400" />
                  {isSidebarOpen && <span>Settings</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all mt-4"
                >
                  <LogOut size={20} />
                  {isSidebarOpen && <span>Logout</span>}
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Sidebar Footer / Profile */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
          <div className={`p-2 rounded-2xl flex items-center ${isSidebarOpen ? "gap-3" : "justify-center"} ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green font-bold shrink-0 uppercase">
              {adminName.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{adminName}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight tracking-wider">
                  {userRole === 'admin' ? 'Administrator' :
                    userRole === 'petugas' ? 'Petugas' :
                      (userIdentifier.includes('@') ? userIdentifier : 'User')}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className={`h-20 border-b flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300
          ${theme === 'dark' ? 'bg-(--background) border-(--border-color)' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              {isSidebarOpen ? <Menu size={20} /> : <X size={20} />}
            </button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Good Morning ✨
            </h2>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Search */}
            <div className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border transition-all w-64 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400 focus-within:border-brand-green/30' : 'bg-slate-100 border-transparent text-slate-500 focus-within:border-brand-green/30 focus-within:bg-white'
              }`}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>

            <div className={`flex items-center gap-2 pr-2 lg:pr-6 ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} border-r`}>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-full relative transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-50 text-slate-400'}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-brand-dark"></span>
                </button>

                {showNotifications && (
                  <div className={`absolute right-0 mt-4 w-96 rounded-3xl shadow-2xl border transition-all duration-200 overflow-hidden
                    ${theme === 'dark' ? 'bg-(--card-bg) border-(--border-color)' : 'bg-white border-slate-100'}`}>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <h3 className="font-bold">Notifications</h3>
                      <span className="text-[10px] font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-md">3 NEW</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <NotificationItem
                        icon={<AlertCircle className="text-red-500" size={16} />}
                        title="Alat Terlambat"
                        desc="Bor Listrik belum dikembalikan oleh Syarif"
                        time="2 jam yang lalu"
                        theme={theme}
                      />
                      <NotificationItem
                        icon={<CheckCircle2 className="text-emerald-500" size={16} />}
                        title="Stok Ditambahkan"
                        desc="5 unit Obeng Set baru telah tiba"
                        time="5 jam yang lalu"
                        theme={theme}
                      />
                      <NotificationItem
                        icon={<Package className="text-blue-500" size={16} />}
                        title="Peminjaman Baru"
                        desc="Admin menyetujui peminjaman Geofisika"
                        time="Kemarin"
                        theme={theme}
                      />
                    </div>
                    <button className="w-full py-4 text-xs font-bold text-slate-500 hover:text-brand-green hover:bg-brand-green/5 transition-all">
                      View All Activity
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <div className={`flex p-1 rounded-full transition-colors ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`p-1.5 rounded-full transition-all ${theme === 'light' ? "bg-white shadow-sm text-brand-green" : "text-slate-500 hover:text-white"}`}
                >
                  <Sun size={16} />
                </button>
                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? "bg-brand-dark shadow-sm text-brand-green" : "text-slate-500 hover:text-slate-900"}`}
                >
                  <Moon size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ${theme === 'dark' ? 'bg-(--background)' : 'bg-[#f8fafc]'}`}>
          {children}
        </div>

        {/* Full Screen Modals */}
        {showSettings && (
          <div className={`fixed inset-0 z-60 flex items-center justify-center p-4 animate-in fade-in duration-200 ${theme === 'dark' ? 'bg-black/60' : 'bg-slate-900/40'} backdrop-blur-sm`}>
            <div className={`w-full max-w-2xl rounded-[40px] shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200
                      ${theme === 'dark' ? 'bg-(--background) border-(--border-color)' : 'bg-white border-slate-200'}`}>
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-green/20 rounded-2xl flex items-center justify-center text-brand-green">
                    <SettingsIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">System Settings</h2>
                    <p className="text-sm text-slate-500">Configure your application preference</p>
                  </div>
                </div>
                <button onClick={() => setShowSettings(false)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors 
                            ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingItem title="Appearance" icon={<Palette className="text-brand-green" size={18} />} theme={theme}>
                  <p className="text-xs text-slate-500 mb-3">Switch between dark and light themes</p>
                  <div className={`flex p-1 rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <button onClick={toggleTheme} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}>
                      Light
                    </button>
                    <button onClick={toggleTheme} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-brand-green text-black' : 'text-slate-400'}`}>
                      Dark
                    </button>
                  </div>
                </SettingItem>

                <SettingItem title="Profile" icon={<UserIcon className="text-blue-400" size={18} />} theme={theme}>
                  <p className="text-xs text-slate-500 mb-2">Logged in as <span className="font-bold text-slate-400">{adminName}</span></p>
                  <button className={`w-full py-2 rounded-xl text-xs font-bold border transition-all 
                                ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                    Change Information
                  </button>
                </SettingItem>

                <SettingItem title="Security" icon={<Shield className="text-purple-400" size={18} />} theme={theme}>
                  <p className="text-xs text-slate-500 mb-2">Update your secure password regularly</p>
                  <button className={`w-full py-2 rounded-xl text-xs font-bold border transition-all 
                                ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                    Update Password
                  </button>
                </SettingItem>

                <SettingItem title="Session" icon={<LogOut className="text-red-400" size={18} />} theme={theme}>
                  <p className="text-xs text-slate-500 mb-2">End your current working session</p>
                  <button onClick={logout} className="w-full py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-all">
                    Logout Now
                  </button>
                </SettingItem>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NotificationItem({ icon, title, desc, time, theme }: any) {
  return (
    <div className={`px-6 py-4 flex gap-4 transition-colors cursor-pointer border-b last:border-none 
            ${theme === 'dark' ? 'hover:bg-white/5 border-white/5 text-slate-300' : 'hover:bg-slate-50 border-slate-50 text-slate-600'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 
                ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-[10px] text-slate-500 line-clamp-1">{desc}</p>
        <p className="text-[9px] text-brand-green font-bold mt-1 uppercase tracking-tighter">{time}</p>
      </div>
    </div>
  );
}

function SettingItem({ title, icon, children, theme }: any) {
  return (
    <div className={`p-6 rounded-[32px] border transition-colors 
            ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h4 className="font-bold text-sm tracking-tight">{title}</h4>
      </div>
      {children}
    </div>
  );
}
