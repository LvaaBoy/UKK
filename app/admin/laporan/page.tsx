"use client";
import React, { useEffect, useState } from "react";
import {
    Download,
    Filter,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    History,
    CheckCircle2,
    Clock,
    Loader2,
    Printer
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function LaporanPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [printDate] = useState(new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }));

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

    const handleExportPDF = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
            </div>
        );
    }

    const { theme } = useTheme();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Print Only Header */}
            <div className="hidden print:block mb-10 border-b-2 border-slate-200 pb-6 text-center">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">LAPORAN PEMINJAMAN ALAT</h1>
                <p className="text-slate-500 font-medium">Sistem Informasi Inventaris & Peminjaman Lab</p>
                <div className="mt-4 text-sm text-slate-400 font-bold">Dicetak pada: {printDate}</div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Laporan Aktivitas</h1>
                    <p className="text-slate-500 text-sm mt-1">Pantau performa dan riwayat peminjaman alat.</p>
                </div>
                <div className="flex gap-3">
                    <button className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border transition-all
                        ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <Filter size={18} />
                        Filter Periode
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="bg-brand-green hover:bg-opacity-90 text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <Download size={18} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4">
                <ReportCard title="Total Peminjaman" value={data.stats.totalPeminjaman} icon={<History size={20} />} trend="+12%" theme={theme} />
                <ReportCard title="Alat Tersedia" value={data.stats.alatTersedia} icon={<CheckCircle2 size={20} />} trend="+3" theme={theme} />
                <ReportCard title="Total Anggota" value={data.stats.totalUsers} icon={<TrendingUp size={20} />} trend="+2" theme={theme} />
                <ReportCard title="Aduan/Terlambat" value="0" icon={<Clock size={20} />} trend="Stable" color="red" theme={theme} />
            </div>

            {/* Detailed Table */}
            <div className={`rounded-[32px] border shadow-sm overflow-hidden print:shadow-none print:border-none transition-colors 
                ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border)' : 'bg-white border-slate-100'}`}>
                <div className={`p-8 border-b flex items-center justify-between print:px-0 ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                        <Printer size={20} className="hidden print:block text-brand-green" />
                        Riwayat Peminjaman Terkini
                    </h3>
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full print:hidden
                        ${theme === 'dark' ? 'bg-white/5 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>Real-time Data</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className={`font-bold uppercase text-[10px] tracking-wider border-b ${theme === 'dark' ? 'text-slate-600 border-white/5' : 'text-slate-400 border-slate-50'}`}>
                            <tr>
                                <th className="py-6 px-8 print:px-2">TRANSAKSI</th>
                                <th className="py-6 px-4">PENGGUNA</th>
                                <th className="py-6 px-4">ALAT</th>
                                <th className="py-6 px-4">TANGGAL</th>
                                <th className="py-6 px-4 text-center">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
                            {data.recentActivities.length > 0 ? data.recentActivities.map((row: any) => (
                                <tr key={row.id} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                                    <td className="py-5 px-8 print:px-2 font-medium text-slate-400 italic">#{row.id}</td>
                                    <td className={`py-5 px-4 font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{row.user}</td>
                                    <td className={`py-5 px-4 font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{row.item}</td>
                                    <td className="py-5 px-4 text-slate-400">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <Calendar size={14} className="print:hidden" />
                                            {row.date}
                                        </div>
                                    </td>
                                    <td className="py-5 px-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider inline-block min-w-[90px] border ${row.status === 'KEMBALI' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            row.status === 'DIPINJAM' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-300 font-bold">Belum ada data peminjaman</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="hidden print:block mt-20">
                <div className="flex justify-between items-end px-10">
                    <div className="text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-20">Diketahui Oleh</p>
                        <div className="w-40 border-b border-slate-800 mx-auto"></div>
                        <p className="mt-2 font-bold">Kepala Lab</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-20">Petugas Bertugas</p>
                        <div className="w-40 border-b border-slate-800 mx-auto"></div>
                        <p className="mt-2 font-bold">Admin Sistem</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReportCard({ title, value, icon, trend, color = "emerald", theme }: any) {
    return (
        <div className={`p-6 rounded-[32px] border shadow-sm relative overflow-hidden group print:rounded-2xl print:p-4 transition-colors
            ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border)' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all print:hidden
                    ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-400'} group-hover:bg-brand-green/10 group-hover:text-brand-green`}>
                    {icon}
                </div>
                <span className={`text-[10px] font-bold flex items-center px-2 py-1 rounded-full print:hidden
                    ${color === 'red' ? 'text-red-500' : 'text-emerald-400'} ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <ArrowUpRight size={10} className={color === 'red' ? 'rotate-90' : ''} />
                    {trend}
                </span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">{title}</p>
            <h4 className={`text-2xl font-bold px-1 print:text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{value}</h4>
        </div>
    )
}
