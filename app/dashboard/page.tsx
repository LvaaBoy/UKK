"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  ChevronRight,
  Search,
  Box,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import { EquipmentDetailModal } from "@/components/inventory/EquipmentDetailModal";
import Link from "next/link";

export default function UserDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: { pendingRequests: string; activeLoans: string; totalLoans: string };
    recentActivities: Array<{ id: string; item: string; date: string; status: string }>;
    recommendedTools: Array<{ id: number; name: string; nama_alat?: string; quantity: number; stok?: number; deskripsi?: string; nama_kategori?: string }>;
    error?: string;
  } | null>(null);

  const { showToast } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'detail' | 'borrow'>('detail');
  const [tanggalKembali, setTanggalKembali] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        setData({
          error: err instanceof Error ? err.message : "Unknown error",
          stats: { pendingRequests: "0", activeLoans: "0", totalLoans: "0" },
          recentActivities: [],
          recommendedTools: []
        });
        setLoading(false);
      });
  }, []);

  const handleOpenDetail = (tool: any) => {
    // Normalize data structure for the modal
    const normalizedTool = {
      ...tool,
      nama_alat: tool.nama_alat || tool.name,
      stok: tool.stok ?? tool.quantity,
      nama_kategori: tool.nama_kategori || "General Equipment"
    };
    setSelectedTool(normalizedTool);
    setModalMode('detail');
    setShowModal(true);
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool || !tanggalKembali) return;

    setSubmitting(true);
    showToast("Mengirim pengajuan...", "loading");

    try {
      const res = await fetch("/api/user/peminjaman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alat_id: selectedTool.id,
          tanggal_pinjam: new Date().toISOString().split('T')[0],
          tanggal_kembali: tanggalKembali
        }),
      });

      const result = await res.json();

      if (res.ok) {
        showToast("Pengajuan berhasil dikirim!", "success");
        setShowModal(false);
        setTanggalKembali("");
        // Refresh stats if needed, or just let it be
      } else {
        showToast(result.error || "Gagal mengirim pengajuan.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">{t('preparing_workspace')}</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-20 text-center animate-in zoom-in duration-500">
        <div className="bg-white p-8 rounded-[40px] border border-pink-100 shadow-xl shadow-pink-500/5 max-w-md mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-pink-500" />
          <AlertCircle size={48} className="mx-auto mb-4 text-pink-500" />
          <h2 className="text-2xl font-black text-blue-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">{data?.error || t('error_loading_dashboard')}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white px-6 py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            {t('try_again')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Hero Welcome Section */}
      <div className="bg-white rounded-[40px] border border-blue-100 p-8 md:p-12 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-400 to-pink-400 opacity-5 -mr-20 -mt-20 rounded-full group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500 opacity-[0.02] -ml-16 -mb-16 rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-500 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
              <Sparkles size={14} /> {t('welcome')}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-blue-900 leading-tight">
              {t('lend_tools_desc')} <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-pink-500">confidence.</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md">{t('modern_toolkit_desc')}</p>
          </div>
          <Link
            href="/dashboard/alat"
            className="group relative bg-blue-900 text-white px-8 py-5 rounded-[24px] font-black flex items-center gap-3 hover:bg-black transition-all shadow-2xl shadow-blue-900/20 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            <Search size={20} />
            <span>{t('explore_inventory')}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardStat
          title={t('active_loans')}
          value={data.stats.activeLoans}
          icon={<CheckCircle2 size={22} />}
          color="blue"
          href="/dashboard/peminjaman"
        />
        <DashboardStat
          title={t('pending')}
          value={data.stats.pendingRequests}
          icon={<Clock size={22} />}
          color="pink"
          href="/dashboard/peminjaman"
        />
        <DashboardStat
          title={t('total_loans')}
          value={data.stats.totalLoans}
          icon={<Box size={22} />}
          color="blue"
          href="/dashboard/peminjaman"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-blue-100 shadow-xl shadow-blue-500/5 p-8 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div className="space-y-1">
              <h3 className="font-black text-2xl text-blue-900 uppercase tracking-tight">{t('recent_activity')}</h3>
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">{t('history')} overview</p>
            </div>
            <Link href="/dashboard/peminjaman" className="p-3 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all group">
              <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {data.recentActivities.map((row, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-blue-50 transition-all group shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 font-black border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                    {row.item.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{row.item}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">{row.date}</p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${row.status === 'KEMBALI' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  row.status === 'DISETUJUI' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    row.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                  {row.status}
                </span>
              </div>
            ))}
            {data.recentActivities.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest opacity-50">
                {t('no_activity')}
              </div>
            )}
          </div>
        </div>

        {/* Recommended / Available */}
        <div className="bg-white rounded-[40px] border border-blue-100 shadow-xl shadow-blue-500/5 p-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="font-black text-xl text-blue-900 uppercase tracking-tighter">{t('available_tools')}</h3>
            <Link href="/dashboard/alat" className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] hover:text-pink-500 transition-colors">{t('see_all')}</Link>
          </div>

          <div className="space-y-4 relative z-10">
            {data.recommendedTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleOpenDetail(tool)}
                className="block p-5 bg-slate-50/50 hover:bg-blue-50/30 rounded-3xl border border-transparent hover:border-blue-100 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-black text-blue-900 group-hover:text-blue-500 transition-colors text-sm uppercase tracking-tight">{tool.nama_alat || tool.name}</h4>
                  <div className="px-2 py-0.5 bg-white border border-slate-100 rounded-md text-[9px] font-black text-pink-500 uppercase">{t('stock')}: {tool.stok ?? tool.quantity}</div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-relaxed mb-4">{tool.deskripsi || t('premium_equipment_desc')}</p>
                <div className="flex items-center text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('lend_now')} <ChevronRight size={12} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <EquipmentDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        tool={selectedTool}
        modalMode={modalMode}
        setModalMode={setModalMode}
        tanggalKembali={tanggalKembali}
        setTanggalKembali={setTanggalKembali}
        handleBorrow={handleBorrow}
        submitting={submitting}
      />
    </div>
  );
}

function DashboardStat({ title, value, icon, color, href }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}) {
  const isBlue = color === "blue";
  return (
    <Link href={href} className={`p-8 rounded-[40px] border shadow-xl shadow-blue-500/5 bg-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between
      ${isBlue ? 'border-blue-100' : 'border-pink-100'}`}>

      <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700
        ${isBlue ? 'bg-blue-500' : 'bg-pink-500'}`} />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className={`p-3.5 rounded-2xl shadow-sm ${isBlue ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
          {icon}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <ChevronRight size={18} className={isBlue ? 'text-blue-300' : 'text-pink-300'} />
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">{title}</p>
        <h4 className="text-4xl font-black text-blue-900 group-hover:text-blue-500 transition-colors tracking-tighter">{value}</h4>
      </div>
    </Link>
  );
}
