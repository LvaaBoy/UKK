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
  Loader2,
  Calendar
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">{t('preparing_workspace')}</p>
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-8 text-center glass rounded-3xl mx-auto max-w-lg mt-10">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-blue-900 mb-2">{t('error_loading_dashboard')}</h2>
        <p className="text-slate-500 mb-6">{data?.error || "Unknown Error"}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
        >
          {t('try_again')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 tracking-tight">{t('stats')}</h1>
          <p className="text-slate-500 font-medium">{t('monitoring_desc')}</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-blue-100 self-start">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-200">{t('realtime')}</button>
          <button className="px-4 py-2 text-slate-400 text-xs font-bold hover:text-blue-500 transition-colors">{t('history')}</button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('total_loans')}
          value={data.stats.totalPeminjaman}
          change="+12.5%"
          isPositive={true}
          icon={<History size={20} />}
          color="blue"
        />
        <StatCard
          title={t('stock')}
          value={data.stats.alatTersedia}
          change="+2.4%"
          isPositive={true}
          icon={<Wrench size={20} />}
          color="pink"
        />
        <StatCard
          title={t('users')}
          value={data.stats.totalUsers}
          change="-1.2%"
          isPositive={false}
          icon={<Users size={20} />}
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 p-8 rounded-[40px] border border-blue-100 bg-white/60 backdrop-blur-md shadow-xl shadow-blue-500/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-xl text-blue-900">{t('weekly_activity')}</h3>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">{t('lending_trends')}</p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-500"><TrendingUp size={20} /></div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.weekly.length > 0 ? data.charts.weekly : [{ day: 'N/A', count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '24px',
                    border: '1px solid #EFF6FF',
                    boxShadow: '0 20px 25px -5px rgb(59 130 246 / 0.1)'
                  }}
                  itemStyle={{ color: '#1e3a8a', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#colorBlue)"
                  radius={[12, 12, 4, 4]}
                  barSize={45}
                />
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="p-8 rounded-[40px] border border-blue-100 bg-white/60 backdrop-blur-md shadow-xl shadow-blue-500/5">
          <h3 className="font-bold text-xl text-blue-900 mb-8">{t('categories')}</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.charts.categories.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? '#3b82f6' : '#ec4899'}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-3xl font-black text-blue-900">100%</p>
              <p className="text-[10px] text-pink-400 font-black uppercase tracking-widest mt-1">Tools</p>
            </div>
          </div>
          <div className="space-y-4 mt-8 overflow-y-auto max-h-40 scrollbar-hide">
            {data.charts.categories.map((item: any, idx: number) => (
              <div key={item.name} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${idx % 2 === 0 ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-blue-900 transition-colors">{item.name}</span>
                </div>
                <div className="px-3 py-1 bg-white border border-blue-50 rounded-lg text-xs font-black text-blue-500">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        {/* Stock Alerts */}
        <div className="bg-white rounded-[40px] border border-blue-100 shadow-xl shadow-blue-500/5 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><AlertTriangle size={20} /></div>
              <h3 className="font-bold text-xl text-blue-900">{t('stock_alerts')}</h3>
            </div>
          </div>
          <div className="space-y-4">
            {data.stockAlerts.map((row: any) => (
              <div key={row.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-red-50/30 rounded-3xl border border-transparent hover:border-red-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 font-bold border border-slate-100 group-hover:border-red-200 uppercase text-xs">{row.id}</div>
                  <div>
                    <p className="font-bold text-blue-900">{row.product}</p>
                    <p className="text-xs text-slate-400 font-medium">{t('insufficient_stock')}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-red-500 font-black text-lg">{row.quantity}</span>
                  <span className="text-[10px] font-black text-red-300 uppercase tracking-tighter">{t('units_left')}</span>
                </div>
              </div>
            ))}
            {data.stockAlerts.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">{t('all_stocked')}</p>}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-[40px] border border-blue-100 shadow-xl shadow-blue-500/5 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><History size={20} /></div>
              <h3 className="font-bold text-xl text-blue-900">{t('recent_activity')}</h3>
            </div>
            <button className="text-xs font-bold text-blue-500 hover:text-blue-700">{t('view_all')}</button>
          </div>
          <div className="space-y-4">
            {data.recentActivities.map((row: any) => (
              <div key={row.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-blue-50/30 rounded-3xl border border-transparent hover:border-blue-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 font-bold border border-slate-100 group-hover:border-blue-200 uppercase">
                    {row.user.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">{row.user}</p>
                    <p className="text-xs text-slate-500 font-medium">{row.item}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black border tracking-wider shadow-sm ${row.status === 'KEMBALI' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    row.status === 'DISETUJUI' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      row.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {row.status}
                  </span>
                  <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Calendar size={10} /> {row.date}</p>
                </div>
              </div>
            ))}
            {data.recentActivities.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">{t('no_recent_logs')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon, color }: any) {
  const isBlue = color === "blue";

  return (
    <div className={`p-8 rounded-[40px] border shadow-xl shadow-blue-500/5 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden bg-white
      ${isBlue ? 'border-blue-100' : 'border-pink-100'}`}>

      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700
        ${isBlue ? 'bg-blue-500' : 'bg-pink-500'}`} />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`p-3.5 rounded-2xl shadow-sm ${isBlue ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wider transition-all
          ${isPositive
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
        <h4 className="text-4xl font-black text-blue-900 group-hover:text-blue-500 transition-colors">{value}</h4>
      </div>

      <div className="mt-6 flex items-center justify-between relative z-10">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 w-[70%] ${isBlue ? 'bg-blue-400' : 'bg-pink-400'}`} />
        </div>
      </div>
    </div>
  );
}
