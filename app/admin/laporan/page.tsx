"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  Filter,
  ArrowUpRight,
  TrendingUp,
  History,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/* =====================
   TYPES
===================== */
type Stats = {
  totalPeminjaman: string;
  alatTersedia: string;
  totalUsers: string;
};

type WeeklyActivity = {
  day: string;
  count: number;
};

type CategoryDistribution = {
  name: string;
  value: number;
};

type StockAlert = {
  id: number;
  nama_alat: string;
  stok: number;
};

type RecentActivity = {
  id: string;
  user: string;
  item: string;
  date: string;
  status: "KEMBALI" | "DISETUJUI" | "DIPINJAM" | "PENDING" | "TERLAMBAT";
};

type LaporanData = {
  stats: Stats;
  weeklyActivity: WeeklyActivity[];
  categoryDistribution: CategoryDistribution[];
  stockAlerts: StockAlert[];
  recentActivities: RecentActivity[];
};

type ReportCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color?: "emerald" | "red";
  theme: "dark" | "light";
};

export default function LaporanPage() {
  const { theme } = useTheme();
  const [data, setData] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [printDate] = useState(
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const res = await fetch("/api/admin/stats");
        const json: LaporanData = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch statistics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportPDF = (): void => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      {/* Print Header */}
      <div className="hidden print:block mb-10 border-b-2 border-slate-200 pb-6 text-center">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">
          LAPORAN PEMINJAMAN ALAT
        </h1>
        <p className="text-slate-500 font-medium">
          Sistem Informasi Inventaris & Peminjaman Lab
        </p>
        <div className="mt-4 text-sm text-slate-400 font-bold">
          Dicetak pada: {printDate}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-800"
            }`}
          >
            Laporan Aktivitas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau performa dan riwayat peminjaman alat.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border transition-all
            ${
              theme === "dark"
                ? "bg-white/5 border-white/10 text-slate-300"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <Filter size={18} />
            Filter Periode
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-brand-green text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-2">
        <ReportCard
          title="Total Peminjaman"
          value={data.stats.totalPeminjaman}
          icon={<History size={20} />}
          trend="+12%"
          theme={theme}
        />
        <ReportCard
          title="Alat Tersedia"
          value={data.stats.alatTersedia}
          icon={<CheckCircle2 size={20} />}
          trend="+3"
          theme={theme}
        />
        <ReportCard
          title="Total Anggota"
          value={data.stats.totalUsers}
          icon={<TrendingUp size={20} />}
          trend="+2"
          theme={theme}
        />
        <ReportCard
          title="Aduan/Terlambat"
          value="0"
          icon={<Clock size={20} />}
          trend="Stable"
          color="red"
          theme={theme}
        />
      </div>

      {/* Table */}
      <div
        className={`rounded-[32px] border shadow-sm overflow-hidden ${
          theme === "dark"
            ? "bg-(--card-bg) border-(--card-border)"
            : "bg-white border-slate-100"
        }`}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="uppercase text-[10px] text-slate-400">
              <th className="px-8 py-6">Transaksi</th>
              <th>Pengguna</th>
              <th>Alat</th>
              <th>Tanggal</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.recentActivities.length > 0 ? (
              data.recentActivities.map((row) => (
                <tr key={row.id}>
                  <td className="px-8 py-4 italic text-slate-400">#{row.id}</td>
                  <td className="font-bold">{row.user}</td>
                  <td>{row.item}</td>
                  <td className="text-slate-400">{row.date}</td>
                  <td className="text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-300">
                  Belum ada data peminjaman
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =====================
   COMPONENT
===================== */
function ReportCard({
  title,
  value,
  icon,
  trend,
  color = "emerald",
  theme,
}: ReportCardProps) {
  return (
    <div
      className={`p-6 rounded-[32px] border shadow-sm ${
        theme === "dark"
          ? "bg-(--card-bg) border-(--card-border)"
          : "bg-white border-slate-100"
      }`}
    >
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
          {icon}
        </div>
        <span
          className={`text-xs font-bold ${
            color === "red" ? "text-red-500" : "text-emerald-500"
          }`}
        >
          <ArrowUpRight size={12} />
          {trend}
        </span>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase">{title}</p>
      <h4 className="text-2xl font-bold">{value}</h4>
    </div>
  );
}
