"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  Users,
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  AlertTriangle,
  History,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch statistics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
      </div>
    );
  }

  if (!data) return <div>Gagal memuat data.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Peminjaman"
          value={data.stats.totalPeminjaman}
          change="+12.5%"
          isPositive={true}
          icon={<History size={20} />}
          variant="primary"
        />
        <StatCard
          title="Alat Tersedia"
          value={data.stats.alatTersedia}
          change="+2.4%"
          isPositive={true}
          icon={<Wrench size={20} />}
          variant="outline"
        />
        <StatCard
          title="Total Anggota"
          value={data.stats.totalUsers}
          change="-1.2%"
          isPositive={false}
          icon={<Users size={20} />}
          variant="outline"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className={`lg:col-span-2 p-6 rounded-[32px] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-brand-card border-(--card-border)' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-lg">Statistik Peminjaman Mingguan</h3>
              <p className="text-sm text-slate-400 mt-1">
                <span className="text-emerald-500 font-bold">↑ 2.1%</span> vs minggu lalu
              </p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.weekly.length > 0 ? data.charts.weekly : [{ day: 'N/A', count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e2e2a' : '#f1f5f9'} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? 'var(--card-bg)' : '#fff',
                    borderRadius: '16px',
                    border: theme === 'dark' ? '1px solid var(--card-border)' : '1px solid #f1f5f9',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                />
                <Bar dataKey="count" fill="#00df82" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className={`p-8 rounded-[40px] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-brand-card border-(--card-border)' : 'bg-white border-slate-100'}`}>
          <h3 className="font-bold text-lg mb-8">Kategori Terpopuler</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.charts.categories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0c1411' : '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: theme === 'dark' ? '#1e2e2a' : '#f1f5f9'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Alat</p>
            </div>
          </div>
          <div className="space-y-3 mt-6 overflow-y-auto max-h-32">
            {data.charts.categories.map((item: any) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-500 font-medium truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-bold">{item.value} Alat</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* Stock Alerts */}
        <div className={`p-6 rounded-[32px] border shadow-sm overflow-hidden transition-colors ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border)' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="font-bold text-lg">Peringatan Stok</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={20} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
                <tr>
                  <th className="pb-4 px-2 font-black">CODE</th>
                  <th className="pb-4 px-2 font-black">PRODUCT</th>
                  <th className="pb-4 px-2 font-black">STOK</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
                {data.stockAlerts.map((row: any) => (
                  <tr key={row.id} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="py-4 px-2 font-medium text-slate-400">{row.id}</td>
                    <td className="py-4 px-2 font-bold">{row.product}</td>
                    <td className="py-4 px-2 font-bold text-red-500">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        {row.quantity}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.stockAlerts.length === 0 && (
                  <tr><td colSpan={3} className="py-8 text-center text-slate-400">Tidak ada peringatan stok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities */}
        <div className={`p-6 rounded-[32px] border shadow-sm overflow-hidden transition-colors ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border)' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="font-bold text-lg">Peminjaman Terbaru</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={20} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
                <tr>
                  <th className="pb-4 px-2 font-black">USER</th>
                  <th className="pb-4 px-2 font-black">ITEM</th>
                  <th className="pb-4 px-2 font-black">DATE</th>
                  <th className="pb-4 px-2 font-black">STATUS</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
                {data.recentActivities.map((row: any) => (
                  <tr key={row.id} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 font-black flex items-center justify-center text-[10px] ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                          {row.user.charAt(0)}
                        </div>
                        <span className="font-bold truncate max-w-[100px]">{row.user}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 font-bold">{row.item}</td>
                    <td className="py-4 px-2 text-slate-400 font-medium">{row.date}</td>
                    <td className="py-4 px-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider ${row.status === 'KEMBALI' ? 'bg-emerald-100 text-emerald-600' :
                        row.status === 'DIPINJAM' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentActivities.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">Belum ada aktivitas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon, variant = "outline" }: any) {
  const { theme } = useTheme();

  const isPrimary = variant === "primary";

  return (
    <div className={`p-6 rounded-[32px] border shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-300
      ${isPrimary
        ? (theme === 'dark' ? 'bg-(--card-bg) border-brand-green/50 text-white hover:bg-(--card-bg)/80' : 'bg-white border-emerald-500 text-slate-800 hover:bg-slate-50')
        : (theme === 'dark' ? 'bg-(--card-bg) border-(--card-border) text-white hover:bg-(--card-bg)/80' : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50')
      }`}>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPrimary ? 'bg-brand-green/20 text-brand-green' : (theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-400')}`}>
            {icon}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${isPrimary ? 'text-brand-green' : 'text-slate-400'}`}>{title}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <h4 className={`text-3xl font-bold ${isPrimary ? 'text-brand-green' : 'text-foreground'}`}>{value}</h4>
          <span className={`text-xs font-bold flex items-center ${isPositive ? (isPrimary ? 'text-emerald-500' : 'text-emerald-500') : (isPrimary ? 'text-red-500' : 'text-red-500')}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </span>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <button className={`p-2 rounded-full ${isPrimary ? 'bg-black/10' : (theme === 'dark' ? 'bg-white/5' : 'bg-slate-50')}`}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
