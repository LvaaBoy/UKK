"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  MoreVertical,
  Search,
  Check,
  X,
  PackageCheck
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function PetugasDashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/petugas/stats")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: 'approve' | 'reject') => {
    const rawId = id.replace("#", "");
    const endpoint = status === 'approve' ? 'approve' : 'reject';

    try {
      const res = await fetch(`/api/peminjaman/${rawId}/${endpoint}`, { method: "PUT" });
      if (res.ok) {
        // Refresh data
        const refreshRes = await fetch("/api/petugas/stats");
        const json = await refreshRes.json();
        setData(json);
      } else {
        const error = await res.json();
        alert(error.error || `Gagal ${status === 'approve' ? 'menyetujui' : 'menolak'} peminjaman`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Petugas Dashboard</h1>
          <p className="text-slate-400 mt-1">Kelola peminjaman dan pengembalian alat hari ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className={`px-4 py-2 rounded-xl border transition-all text-sm font-bold flex items-center gap-2
            ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
            <PackageCheck size={18} className="text-brand-green" />
            Stock Check
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Peminjaman Masuk"
          value={data.stats.pendingRequests}
          change="+3 jam ini"
          isPositive={true}
          icon={<Clock size={20} />}
          variant="primary"
        />
        <StatCard
          title="Pinjaman Aktif"
          value={data.stats.activeLoans}
          change="+12% hari ini"
          isPositive={true}
          icon={<CheckCircle2 size={20} />}
          variant="outline"
        />
        <StatCard
          title="Alat Keluar"
          value={data.stats.toolsOut}
          change="-2% hari ini"
          isPositive={false}
          icon={<ClipboardList size={20} />}
          variant="outline"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incoming Requests Table */}
        <div className={`lg:col-span-2 p-6 rounded-[32px] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-brand-card border-(--card-border)' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Peminjaman Perlu Verifikasi</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-md uppercase tracking-wider">Urgent</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
                <tr>
                  <th className="pb-4 px-2">KODE</th>
                  <th className="pb-4 px-2">PEMINJAM</th>
                  <th className="pb-4 px-2">ALAT</th>
                  <th className="pb-4 px-2">TANGGAL</th>
                  <th className="pb-4 px-2 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
                {data.incomingRequests.map((row: any) => (
                  <tr key={row.id} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="py-4 px-2 font-medium text-slate-400">{row.id}</td>
                    <td className="py-4 px-2 font-bold">{row.user}</td>
                    <td className="py-4 px-2 font-bold">{row.item}</td>
                    <td className="py-4 px-2 text-slate-400">{row.date}</td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => updateStatus(row.id, 'approve')}
                          className="w-8 h-8 rounded-lg bg-brand-green/20 text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-black transition-all shadow-lg shadow-emerald-500/10"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => updateStatus(row.id, 'reject')}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.incomingRequests.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400 font-medium">Semua permintaan telah diproses ✨</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Chart / Tracking */}
        <div className={`p-6 rounded-[32px] border shadow-sm transition-colors ${theme === 'dark' ? 'bg-brand-card border-(--card-border)' : 'bg-white border-slate-100'}`}>
          <h3 className="font-bold text-lg mb-6">Arus Peminjaman</h3>
          <div className="h-48 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.activity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e352f' : '#f1f5f9'} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? 'var(--card-bg)' : '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#00df82"
                  strokeWidth={3}
                  dot={{ fill: '#00df82', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pinjaman Terbaru</h4>
            {data.activeTracking.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-emerald-500 bg-emerald-500/10`}>
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{item.user}</p>
                    <p className="text-[10px] text-slate-500">{item.item}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-green transition-colors">{item.date}</span>
              </div>
            ))}
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
        ? (theme === 'dark' ? 'bg-(--card-bg) border-brand-green/30 text-white' : 'bg-white border-emerald-500 text-slate-800')
        : (theme === 'dark' ? 'bg-brand-card border-(--card-border) text-white' : 'bg-white border-slate-100 text-slate-800')
      }`}>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPrimary ? 'bg-brand-green/20 text-brand-green' : (theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-400')}`}>
            {icon}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${isPrimary ? 'text-brand-green font-black' : 'text-slate-400'}`}>{title}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <h4 className={`text-3xl font-bold ${isPrimary ? 'text-brand-green' : 'text-foreground'}`}>{value}</h4>
          <span className={`text-xs font-bold flex items-center ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </span>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <button className={`p-2 rounded-full ${isPrimary ? 'bg-brand-green/10 text-brand-green' : (theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-400')}`}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
