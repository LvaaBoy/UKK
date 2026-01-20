"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Filter,
    Wrench,
    Hammer,
    AlertCircle,
    CheckCircle2,
    Package,
    Loader2,
    Settings,
    Calendar,
    X,
    Send
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function AlatList() {
    const { theme } = useTheme();
    const searchParams = useSearchParams();
    const [alat, setAlat] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedTool, setSelectedTool] = useState<any>(null);
    const [tanggalKembali, setTanggalKembali] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/alat");
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Gagal mengambil data");
            setAlat(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle auto-open if redirected from dashboard
    useEffect(() => {
        const borrowId = searchParams.get("borrow");
        if (borrowId && alat.length > 0) {
            const tool = alat.find(t => t.id.toString() === borrowId);
            if (tool && tool.stok > 0) {
                handleOpenBorrow(tool);
            }
        }
    }, [searchParams, alat]);

    const handleOpenBorrow = (tool: any) => {
        setSelectedTool(tool);
        setShowModal(true);
    };

    const handleBorrow = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/peminjaman", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    alat_id: selectedTool.id,
                    tanggal_kembali: tanggalKembali
                }),
            });

            if (res.ok) {
                alert("Peminjaman berhasil diajukan! Menunggu verifikasi petugas.");
                setShowModal(false);
                fetchData();
            } else {
                const data = await res.json();
                alert(data.error || "Gagal mengajukan peminjaman");
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredAlat = alat.filter(item =>
        item.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">
                        Jelajahi <span className="text-brand-green">Alat Lab</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Temukan dan pinjam alat berkualitas untuk proyek Anda.</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className={`p-4 rounded-[28px] border shadow-sm flex flex-col md:flex-row gap-4 items-center transition-all ${theme === 'dark' ? 'bg-brand-card border-white/5' : 'bg-white border-slate-100'
                }`}>
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari bor, palu, kunci pas..."
                        className={`w-full pl-12 pr-4 py-3.5 border-none rounded-2xl focus:ring-2 focus:ring-brand-green transition-all font-medium 
              ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-800'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 border rounded-2xl font-bold transition-all
          ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <Filter size={18} />
                    Semua Kategori
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
                    {filteredAlat.map((item) => (
                        <div key={item.id} className={`group rounded-[32px] md:rounded-[40px] border p-6 md:p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 relative flex flex-col
              ${theme === 'dark' ? 'bg-brand-card border-white/5' : 'bg-white border-slate-100'}`}>

                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6 md:mb-8 transition-all duration-500 group-hover:scale-110 shadow-inner
                ${theme === 'dark' ? 'bg-white/5 text-slate-400 group-hover:text-brand-green' : 'bg-slate-50 text-slate-400 group-hover:text-brand-green'}`}>
                                {item.nama_kategori.toLowerCase().includes('bor') ? <Settings size={28} /> :
                                    item.nama_kategori.toLowerCase().includes('perkakas') ? <Hammer size={28} /> : <Wrench size={28} />}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg
                    ${theme === 'dark' ? 'bg-brand-green/10 text-brand-green' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {item.nama_kategori}
                                    </span>
                                </div>
                                <h3 className={`font-black text-lg md:text-xl mb-3 md:mb-4 group-hover:text-brand-green transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                    {item.nama_alat}
                                </h3>
                                <p className="text-xs md:text-sm text-slate-400 line-clamp-2 mb-6 md:mb-8 font-medium">
                                    {item.deskripsi || "Alat laboratorium berkualitas tinggi untuk mendukung kegiatan praktikum dan penelitian Anda."}
                                </p>
                            </div>

                            <div className={`flex items-center justify-between pt-6 border-t font-bold ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Stok</span>
                                    <span className={`text-lg md:text-xl ${item.stok < 3 ? "text-red-500" : (theme === 'dark' ? "text-white" : "text-slate-800")}`}>{item.stok}</span>
                                </div>

                                <button
                                    onClick={() => handleOpenBorrow(item)}
                                    disabled={item.stok === 0}
                                    className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2
                    ${item.stok > 0
                                            ? "bg-brand-green text-black hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"}`}
                                >
                                    {item.stok > 0 ? "Pinjam Alat" : "Habis"}
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredAlat.length === 0 && (
                        <div className="col-span-full py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Package size={40} />
                            </div>
                            <h3 className="font-black text-xl text-slate-800">Alat tidak ditemukan</h3>
                            <p className="text-slate-500 font-medium mt-2">Coba gunakan kata kunci pencarian yang berbeda.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Borrow Modal */}
            {showModal && selectedTool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className={`rounded-[48px] w-full max-w-md p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 border
            ${theme === 'dark' ? 'bg-brand-card border-white/5 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-10">
                            <div className="w-16 h-16 bg-brand-green/10 rounded-[20px] flex items-center justify-center text-brand-green mb-6 shadow-inner">
                                <Calendar size={32} />
                            </div>
                            <h2 className="text-3xl font-black">Ajukan Pinjaman</h2>
                            <p className="text-slate-400 mt-2 font-medium">Anda akan meminjam <span className="text-brand-green font-bold">{selectedTool.nama_alat}</span>.</p>
                        </div>

                        <form onSubmit={handleBorrow} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kapan akan dikembalikan?</label>
                                <div className="relative">
                                    <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green" />
                                    <input
                                        required
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full pl-14 pr-6 py-4 border-none rounded-[20px] focus:ring-2 focus:ring-brand-green transition-all font-bold 
                      ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-800'}`}
                                        value={tanggalKembali}
                                        onChange={(e) => setTanggalKembali(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="bg-brand-green/5 border border-brand-green/10 p-5 rounded-[24px]">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={20} className="text-brand-green mt-0.5" />
                                    <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                                        Pastikan Anda telah memeriksa kondisi fisik alat. Peminjaman ini memerlukan verifikasi dari Petugas Lab sebelum alat dapat diambil.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-5 bg-brand-green text-black font-black rounded-[24px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                                {submitting ? "Mengajukan..." : "Kirim Pengajuan"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function UserAlatPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center font-black">MEMUAT...</div>}>
            <AlatList />
        </Suspense>
    );
}
