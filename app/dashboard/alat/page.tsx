"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Filter,
    Settings,
    Hammer,
    Wrench,
    Package,
    Loader2
} from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { EquipmentDetailModal } from "@/components/inventory/EquipmentDetailModal";
import { useTranslation } from "@/app/context/LanguageContext";

function AlatList() {
    const { showToast } = useNotification();
    const { t, language } = useTranslation();
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

    const translateCategory = (name: string) => {
        if (!name) return "";
        const key = `category_${name.toLowerCase().replace(/\s+/g, "_")}` as any;
        const translated = t(key);
        return translated === key ? name : translated;
    };

    const translateName = (name: string) => {
        if (!name) return "";
        const key = `tool_name_${name.toLowerCase().replace(/\s+/g, '_')}` as any;
        const translated = t(key);
        return translated === key ? name : translated;
    };

    const translateDesc = (desc: string, name: string) => {
        if (!name) return desc;
        const key = `tool_desc_${name.toLowerCase().replace(/\s+/g, '_')}` as any;
        const translated = t(key);
        return translated === key ? desc : translated;
    };

    const fetchData = async () => {
        try {
            const res = await fetch("/api/alat");
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || t("error_loading_data"));

            if (json.success && Array.isArray(json.data)) {
                setAlat(json.data);
            } else {
                setAlat([]);
            }
        } catch (err) {
            console.error(err);
            showToast(t("error_loading_data"), "error");
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
        showToast(t("sending_request"), "loading");

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
                showToast(t("request_sent_success"), "success");
                setShowModal(false);
                fetchData();
            } else {
                showToast(data.error || t("request_failed"), "error");
            }
        } catch (err) {
            console.error(err);
            showToast(t("system_error"), "error");
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
                    <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">
                        {t("explore_lab_tools")} <span className="text-brand-green">{t("lab_tools")}</span>
                    </h1>
                    <p className="text-(--text-secondary) mt-2 font-medium">{t("explore_tools_desc")}</p>
                </div>
            </div>

            <div className="p-4 rounded-[28px] border shadow-sm flex flex-col md:flex-row gap-4 items-center transition-all bg-(--card) border-(--border)">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-secondary)" size={18} />
                    <input
                        type="text"
                        placeholder={t("search_tools_placeholder")}
                        className="w-full pl-12 pr-4 py-3.5 border-none rounded-2xl focus:ring-2 focus:ring-brand-green transition-all font-medium bg-(--background) text-(--text-primary)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 border rounded-2xl font-bold transition-all bg-(--card) border-(--border) text-(--text-secondary) hover:bg-(--background)">
                    <Filter size={18} />
                    {t("all_categories")}
                </button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
                    {filteredAlat.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleOpenDetail(item)}
                            className="group rounded-[32px] md:rounded-[40px] border p-6 md:p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 relative flex flex-col cursor-pointer bg-(--card) border-(--border)"
                        >
                            <div className="aspect-video md:aspect-4/3 rounded-[24px] md:rounded-[32px] overflow-hidden mb-6 md:mb-8 group-hover:scale-[1.02] transition-all duration-500 shadow-inner relative border border-(--border) bg-(--background)">
                                {item.gambar ? (
                                    <img
                                        src={item.gambar}
                                        alt={translateName(item.nama_alat)}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-(--text-secondary)">
                                        {item.nama_kategori.toLowerCase().includes('bor') ? <Settings size={48} /> :
                                            item.nama_kategori.toLowerCase().includes('perkakas') ? <Hammer size={48} /> : <Wrench size={48} />}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                                        {translateCategory(item.nama_kategori)}
                                    </span>
                                </div>
                                <h3 className="font-black text-lg md:text-xl mb-3 md:mb-4 group-hover:text-brand-green transition-colors text-(--text-primary)">
                                    {translateName(item.nama_alat)}
                                </h3>
                                <p className="text-xs md:text-sm text-(--text-secondary) line-clamp-2 mb-6 md:mb-8 font-medium">
                                    {translateDesc(item.deskripsi, item.nama_alat) || t("default_tool_desc")}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-(--border) font-bold">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-(--text-secondary) uppercase tracking-widest mb-1">{t("stock")}</span>
                                    <span className={`text-lg md:text-xl ${item.stok < 3 ? "text-red-500" : "text-(--text-primary)"}`}>{item.stok}</span>
                                </div>

                                <div
                                    className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2
                    ${item.stok > 0
                                            ? "bg-brand-green text-black group-hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"}`}
                                >
                                    {item.stok > 0 ? t("borrow_tool") : t("out_of_stock")}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredAlat.length === 0 && (
                        <div className="col-span-full py-24 text-center">
                            <div className="w-20 h-20 bg-(--background) rounded-full flex items-center justify-center mx-auto mb-6 text-(--text-secondary) opacity-30">
                                <Package size={40} />
                            </div>
                            <h3 className="font-black text-xl text-(--text-primary)">{t("tool_not_found")}</h3>
                            <p className="text-(--text-secondary) font-medium mt-2">{t("try_different_search")}</p>
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
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
            </div>
        }>
            <AlatList />
        </Suspense>
    );
}
