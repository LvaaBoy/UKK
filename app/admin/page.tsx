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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import {
  Users,
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  History,
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useTranslation } from "../context/LanguageContext";

/* =====================
   TYPES
 ===================== */
type Stats = {
  totalPeminjaman: string;
  alatTersedia: string;
  totalUsers: string;
  revenue: number;
};

type ChartData = {
  name: string;
  value: number;
};

type OverdueItem = {
  id: string;
  user: string;
  item: string;
  deadline: string;
  days_late: number;
};

type DashboardData = {
  stats: Stats;
  charts: {
    weekly: { day: string; count: number }[];
    status: ChartData[];
    popular: ChartData[];
  };
  stockAlerts: { id: string; product: string; quantity: number }[];
  overdueItems: OverdueItem[];
  error?: string;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();
  const router = useRouter();

  const fetchStats = async (): Promise<void> => {
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setData({ stats: {} as any, charts: { weekly: [], status: [], popular: [] }, stockAlerts: [], overdueItems: [], error: json.error });
      }
    } catch (err) {
      console.error("Failed to fetch statistics", err);
      setData({ stats: {} as any, charts: { weekly: [], status: [], popular: [] }, stockAlerts: [], overdueItems: [], error: "Connection failed" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-blue-500" />
          </div>
          <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em] animate-pulse">Initializing Command Center</p>
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-12 text-center bg-white rounded-[40px] border border-red-100 shadow-2xl shadow-red-500/5 mx-auto max-w-xl mt-20">
        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-blue-900 mb-2">System Failure</h2>
        <p className="text-slate-500 mb-8 font-medium">{data?.error || "Unable to establish connection to monitoring services."}</p>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 uppercase text-sm tracking-widest">
          Reconnect System
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">System Live</div>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><Activity size={12} /> Monitoring active tools & revenue</span>
          </div>
          <h1 className="text-5xl font-black text-blue-900 tracking-tighter">Command Center</h1>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports" onClick={() => router.push("/admin/laporan")}>Reports</TabsTrigger>
            <TabsTrigger value="audit" onClick={() => router.push("/admin/audit-logs")}>Audit Logs</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Hero Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="System Revenue" value={data.stats.revenue ? `Rp ${data.stats.revenue.toLocaleString('id-ID')}` : 'Rp 0'} change="+Rp 450k" isPositive icon={<DollarSign size={20} />} color="emerald" />
        <StatCard title="Total Loans" value={data.stats.totalPeminjaman} change="+8.2%" isPositive icon={<TrendingUp size={20} />} color="blue" />
        <StatCard title="Active Inventory" value={data.stats.alatTersedia} change="-3 units" isPositive={false} icon={<Wrench size={20} />} color="pink" />
        <StatCard title="Registered Users" value={data.stats.totalUsers} change="+12" isPositive icon={<Users size={20} />} color="orange" />
      </div>

      {/* Analytics Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Traffic */}
        <div className="lg:col-span-2 p-10 rounded-[48px] bg-white border border-slate-100 shadow-2xl shadow-blue-500/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-2xl text-blue-900 tracking-tight">Loan Influx <span className="text-slate-300 font-medium">(7 Days)</span></h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400"><div className="w-2 h-2 bg-blue-500 rounded-full" /> REQUESTS</div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.weekly}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-2xl shadow-blue-500/5">
          <h3 className="font-black text-2xl text-blue-900 tracking-tight mb-8">Process Flow</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.charts.status} innerRadius={80} outerRadius={110} dataKey="value" paddingAngle={8}>
                  {data.charts.status.map((entry, index) => (
                    <Cell key={entry.name} fill={['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total</p>
              <h2 className="text-4xl font-black text-blue-900">{data.stats.totalPeminjaman}</h2>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-widest">
            {data.charts.status.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'][i % 5] }} />
                {item.name}: <span className="text-blue-900 font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Incidents & Catalog Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:items-start">
        {/* Overdue Monitoring */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-2xl text-blue-900 flex items-center gap-3">
              <ShieldAlert className="text-pink-600" size={28} />
              Critical Assets <span className="text-pink-500 text-sm font-black bg-pink-50 px-3 py-1 rounded-full">{data.overdueItems.length}</span>
            </h3>
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Late Returns</span>
          </div>
          <div className="bg-slate-900 rounded-[48px] p-8 shadow-2xl shadow-blue-950/20 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32"></div>
            {data.overdueItems.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <History size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-[0.2em] text-sm text-blue-300">No overdue assets recorded</p>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                {data.overdueItems.map((row) => (
                  <div key={row.id} className="flex justify-between items-center group/item hover:translate-x-2 transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-pink-400 shadow-inner">
                        {row.days_late}d
                      </div>
                      <div>
                        <p className="font-black text-sm group-hover/item:text-blue-400 transition-colors uppercase tracking-tight">{row.user}</p>
                        <p className="text-xs text-white/40 font-bold">{row.item}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">Due {row.deadline}</p>
                      <button className="text-[10px] bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 px-4 py-1.5 rounded-xl transition-all font-black uppercase">Send Alert</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Catalog Performance */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-2xl text-blue-900 flex items-center gap-3">
              <TrendingUp className="text-blue-600" size={28} />
              Catalog Heatmap
            </h3>
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Top Demand</span>
          </div>
          <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-2xl shadow-blue-500/5">
            <div className="space-y-8">
              {data.charts.popular.map((tool, idx) => (
                <div key={tool.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">#{idx + 1} {tool.name}</span>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase italic">{tool.value} UTILS</span>
                  </div>
                  <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden flex">
                    <div className="h-full bg-linear-to-r from-blue-600 to-purple-600 rounded-full" style={{ width: `${(tool.value / (data?.charts.popular[0]?.value || 1)) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================
   COMPONENT
 ===================== */
function StatCard({ title, value, change, isPositive, icon, color }: {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "pink" | "orange";
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-500 shadow-emerald-500/10 border-emerald-100",
    blue: "bg-blue-50 text-blue-500 shadow-blue-500/10 border-blue-100",
    pink: "bg-pink-50 text-pink-500 shadow-pink-500/10 border-pink-100",
    orange: "bg-orange-50 text-orange-500 shadow-orange-500/10 border-orange-100"
  };

  return (
    <div className={`p-8 rounded-[48px] bg-white border border-slate-50 shadow-2xl shadow-slate-200/50 group h-full relative overflow-hidden active:scale-95 transition-all duration-300`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-3xl ${colors[color]} border shadow-xs group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-pink-50 text-pink-600"}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">{title}</p>
      <h4 className="text-3xl font-black text-blue-900 tracking-tighter group-hover:text-blue-600 transition-colors uppercase italic">{value}</h4>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-linear-to-tr from-transparent to-slate-50/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
    </div>
  );
}
