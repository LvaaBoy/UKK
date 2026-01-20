"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  Search,
  Box,
  LayoutGrid,
  AlertCircle
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Link from "next/link";

export default function UserDashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/user/stats")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal mengambil data");
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch user stats", err);
        setData({ error: err.message });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-20 text-center">
        <div className="bg-red-500/10 text-red-500 p-8 rounded-[32px] border border-red-500/20 max-w-md mx-auto">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-sm opacity-80 mb-6">{data?.error || "Gagal memuat data dashboard."}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Dashboard <span className="text-brand-green">Peminjam</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Kelola peminjaman alat Anda dengan mudah.</p>
        </div>
        <Link
          href="/dashboard/alat"
          className="bg-brand-green text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-sm"
        >
          <Search size={18} />
          Cari & Pinjam Alat
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pinjaman Aktif"
          value={data.stats.activeLoans}
          icon={<CheckCircle2 size={20} />}
          variant="primary"
          link="/dashboard/peminjaman"
        />
        <StatCard
          title="Menunggu Verifikasi"
          value={data.stats.pendingRequests}
          icon={<Clock size={20} />}
          variant="outline"
          link="/dashboard/peminjaman"
        />
        <StatCard
          title="Total Peminjaman"
          value={data.stats.totalLoans}
          icon={<Box size={20} />}
          variant="outline"
          link="/dashboard/peminjaman"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className={`lg:col-span-2 p-8 rounded-[40px] border shadow-sm ${theme === 'dark' ? 'bg-brand-card border-white/5 shadow-black/50' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold text-xl flex items-center gap-3">
              <span className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </span>
              Aktivitas Terakhir
            </h3>
            <Link href="/dashboard/peminjaman" className="text-brand-green text-sm font-bold flex items-center gap-1 hover:underline">
              Lihat Semua <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 pt-1 px-2 text-xs font-black text-slate-400 uppercase tracking-widest">Item</th>
                  <th className="pb-4 pt-1 px-2 text-xs font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="pb-4 pt-1 px-2 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recentActivities.map((row: any, idx: number) => (
                  <tr key={idx} className="group hover:bg-white/5 transition-colors">
                    <td className="py-5 px-2 font-bold">{row.item}</td>
                    <td className="py-5 px-2 text-slate-400 text-sm">{row.date}</td>
                    <td className="py-5 px-2">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider ${row.status === 'KEMBALI' ? 'bg-emerald-100 text-emerald-600' :
                        row.status === 'DISETUJUI' ? 'bg-blue-100 text-blue-600' :
                          row.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentActivities.length === 0 && (
                  <tr><td colSpan={3} className="py-10 text-center text-slate-400 font-medium">Belum ada riwayat peminjaman.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended Tools */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-xl flex items-center gap-3">
              <span className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                <LayoutGrid size={20} />
              </span>
              Tersedia Sekarang
            </h3>
            <Link href="/dashboard/alat" className="text-brand-green text-sm font-bold hover:underline">
              Jelajahi
            </Link>
          </div>

          <div className="space-y-4">
            {data.recommendedTools.map((tool: any) => (
              <div
                key={tool.id}
                className={`p-6 rounded-3xl border group hover:border-brand-green transition-all shadow-sm active:scale-[0.98] ${theme === 'dark' ? 'bg-brand-card border-white/5' : 'bg-white border-slate-100'
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-brand-green transition-colors">{tool.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{tool.deskripsi || "Alat berkualitas tinggi untuk praktikum."}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'
                    }`}>
                    Stok: {tool.quantity}
                  </span>
                </div>
                <Link
                  href={`/dashboard/alat?borrow=${tool.id}`}
                  className="w-full bg-brand-green/10 text-brand-green py-2.5 rounded-xl text-center text-sm font-black hover:bg-brand-green hover:text-black transition-all inline-block"
                >
                  Pinjam Alat
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, variant = "outline", link }: any) {
  const { theme } = useTheme();
  const isPrimary = variant === "primary";

  return (
    <Link href={link} className={`p-6 rounded-[32px] border shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-300
      ${isPrimary
        ? (theme === 'dark' ? 'bg-brand-card border-brand-green/50 text-white hover:bg-brand-card/80' : 'bg-white border-emerald-500 text-slate-800 hover:bg-slate-50')
        : (theme === 'dark' ? 'bg-brand-card border-white/5 text-white hover:bg-brand-card/80' : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50')
      }`}>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPrimary ? 'bg-brand-green/20 text-brand-green' : (theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-400')}`}>
            {icon}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${isPrimary ? 'text-brand-green' : 'text-slate-400'}`}>{title}</span>
        </div>
        <h4 className={`text-3xl font-black ${isPrimary ? 'text-brand-green' : 'text-foreground'}`}>{value}</h4>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <div className={`p-2 rounded-full ${isPrimary ? 'bg-brand-green text-black' : (theme === 'dark' ? 'bg-white/5' : 'bg-slate-100')}`}>
          <ChevronRight size={16} />
        </div>
      </div>
    </Link>
  );
}