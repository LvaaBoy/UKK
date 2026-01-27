"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Filter,
    Settings,
    Hammer,
    Wrench,
    Package
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { useNotification } from "@/context/NotificationContext";
import { EquipmentDetailModal } from "@/components/inventory/EquipmentDetailModal";

function AlatList() {
    const { theme } = useTheme();
    const { showToast } = useNotification();
    const searchParams = useSearchParams();
    const [alat, setAlat] = useState<Array<{
        id: number;
        nama_alat: string;
        nama_kategori: string;
        stok: number;
        gambar: string;
        deskripsi: string;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'detail' | 'borrow'>('detail');
    const [selectedTool, setSelectedTool] = useState<{
        id: number;
        nama_alat: string;
        nama_kategori: string;
        stok: number;
        gambar: string;
        deskripsi: string;
    } | null>(null);
    const [tanggalKembali, setTanggalKembali] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/alat");
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Gagal mengambil data");

            if (json.success && Array.isArray(json.data)) {
                setAlat(json.data);
            } else {
                setAlat([]);
            }
        } catch (err) {
            console.error(err);
            showToast("Gagal memuat daftar alat.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const borrowId = searchParams.get("borrow");
        if (borrowId && alat.length > 0) {
            const tool = alat.find(t => t.id.toString() === borrowId);
            if (tool && tool.stok > 0) {
                handleOpenDetail(tool);
            }
        }
    }, [searchParams, alat]);

    const handleOpenDetail = (tool: {
        id: number;
        nama_alat: string;
        nama_kategori: string;
        stok: number;
        gambar: string;
        deskripsi: string;
    }) => {
        setSelectedTool(tool);
        setModalMode('detail');
        setShowModal(true);
    };

    const handleBorrow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTool) return;
        setSubmitting(true);
        showToast("Mengajukan peminjaman...", "loading");

        try {
            const res = await fetch("/api/peminjaman", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    alat_id: selectedTool.id,
                    tanggal_kembali: tanggalKembali
                }),
            });

            const data = await res.json();

            if (res.ok) {
                showToast("Peminjaman berhasil diajukan! Menunggu verifikasi petugas.", "success");
                setShowModal(false);
                fetchData();
            } else {
                showToast(data.error || "Gagal mengajukan peminjaman", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Terjadi kesalahan sistem.", "error");
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">
                        Jelajahi <span className="text-brand-green">Alat Lab</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Temukan dan pinjam alat berkualitas untuk proyek Anda.</p>
                </div>
            </div>

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

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
                    {filteredAlat.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleOpenDetail(item)}
                            className={`group rounded-[32px] md:rounded-[40px] border p-6 md:p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 relative flex flex-col cursor-pointer
              ${theme === 'dark' ? 'bg-brand-card border-white/5' : 'bg-white border-slate-100'}`}>

                            <div className={`aspect-video md:aspect-4/3 rounded-[24px] md:rounded-[32px] overflow-hidden mb-6 md:mb-8 group-hover:scale-[1.02] transition-all duration-500 shadow-inner relative border border-slate-100 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                                {item.gambar ? (
                                    <img
                                        src={item.gambar}
                                        alt={item.nama_alat}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        {item.nama_kategori.toLowerCase().includes('bor') ? <Settings size={48} /> :
                                            item.nama_kategori.toLowerCase().includes('perkakas') ? <Hammer size={48} /> : <Wrench size={48} />}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

                                <div
                                    className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2
                    ${item.stok > 0
                                            ? "bg-brand-green text-black group-hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"}`}
                                >
                                    {item.stok > 0 ? "Pinjam Alat" : "Habis"}
                                </div>
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

export default function UserAlatPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center font-black">MEMUAT...</div>}>
            <AlatList />
        </Suspense>
    );
}
