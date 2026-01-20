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
  Check,
  X,
  PackageCheck,
  Loader2,
  History
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/petugas/stats")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setData({ error: "Gagal menghubungkan ke server" });
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: 'approve' | 'reject' | 'return') => {
    const rawId = id.replace("#", "");
    let endpoint = "";

    if (status === 'approve') endpoint = 'approve';
    else if (status === 'reject') endpoint = 'reject';

    try {
      const url = status === 'return' ? `/api/petugas/peminjaman/${rawId}/return` : `/api/peminjaman/${rawId}/${endpoint}`;
      const res = await fetch(url, { method: "PUT" });

      if (res.ok) {
        const refreshRes = await fetch("/api/petugas/stats");
        const json = await refreshRes.json();
        setData(json);
      } else {
        const error = await res.json();
        alert(error.error || `Gagal memproses aksi: ${status}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Syncing logistics...</p>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 tracking-tight">Petugas Dashboard</h1>
          <p className="text-slate-500 font-medium">{t('manage_daily')}</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-blue-100 rounded-2xl shadow-sm text-sm font-bold text-blue-600 hover:border-blue-400 hover:shadow-lg transition-all active:scale-95 self-start">
          <PackageCheck size={20} className="text-pink-500" />
          {t('quick_scan')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PetugasStat
          title={t('incoming_requests')}
          value={data.stats.pendingRequests}
          icon={<Clock size={20} />}
          color="blue"
        />
        <PetugasStat
          title={t('active_loans')}
          value={data.stats.activeLoans}
          icon={<CheckCircle2 size={20} />}
          color="pink"
        />
        <PetugasStat
          title="Tools Out"
          value={data.stats.toolsOut}
          icon={<ClipboardList size={20} />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Table */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-blue-100 shadow-xl shadow-blue-500/5 p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl text-blue-900">{t('needs_verification')}</h3>
            <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">{t('urgent_process')}</span>
          </div>

          <div className="flex-1 space-y-4">
            {data.incomingRequests.map((row: any) => (
              <div key={row.id} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-blue-50/30 rounded-3xl border border-transparent hover:border-blue-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 font-black border border-slate-100 group-hover:border-blue-200">
                    <History size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">{row.user}</p>
                    <p className="text-xs text-slate-500 font-medium">Requests <span className="text-blue-500 font-bold">{row.item}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateStatus(row.id, 'approve')}
                    className="w-11 h-11 rounded-xl bg-white border border-blue-100 text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm active:scale-90"
                  >
                    <Check size={20} className="mx-auto" />
                  </button>
                  <button
                    onClick={() => updateStatus(row.id, 'reject')}
                    className="w-11 h-11 rounded-xl bg-white border border-pink-100 text-pink-500 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all shadow-sm active:scale-90"
                  >
                    <X size={20} className="mx-auto" />
                  </button>
                </div>
              </div>
            ))}
            {data.incomingRequests.length === 0 && (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-400 opacity-50"><CheckCircle2 size={32} /></div>
                <p className="text-slate-400 font-bold">{t('all_caught_up')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Arus Tracking */}
        <div className="bg-white rounded-[40px] border border-blue-100 shadow-xl shadow-blue-500/5 p-8">
          <h3 className="font-bold text-xl text-blue-900 mb-8">{t('flow_tracking')}</h3>
          <div className="h-44 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.activity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    border: '1px solid #EFF6FF',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">{t('active_operations')}</h4>
            {data.activeTracking.map((item: any) => (
              <div key={item.id} className="p-4 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-blue-50 transition-all group relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-400 group-hover:text-blue-600 transition-colors shadow-sm">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-blue-900">{item.user}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.item}</p>
                    </div>
                  </div>
                  {item.status === 'DISETUJUI' && (
                    <button
                      onClick={() => updateStatus(item.id, 'return')}
                      className="text-[10px] font-black bg-pink-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-pink-200 transition-all hover:scale-105 active:scale-95"
                    >
                      {t('return').toUpperCase()}
                    </button>
                  )}
                  {item.status !== 'DISETUJUI' && (
                    <span className="text-[10px] font-bold text-slate-300">{item.date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PetugasStat({ title, value, icon, color }: any) {
  const isBlue = color === "blue";
  return (
    <div className={`p-8 rounded-[40px] border shadow-xl shadow-blue-500/5 bg-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-500
      ${isBlue ? 'border-blue-100' : 'border-pink-100'}`}>
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700
        ${isBlue ? 'bg-blue-500' : 'bg-pink-500'}`} />

      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-2xl ${isBlue ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
          {icon}
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{title}</p>
      </div>
      <h4 className="text-4xl font-black text-blue-900 group-hover:text-blue-500 transition-colors">{value}</h4>
    </div>
  );
}
