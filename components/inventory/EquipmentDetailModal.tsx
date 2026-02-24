"use client";

import React from "react";
import { X, Send, ArrowLeft, Calendar, Clock, Package, Loader2 } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { useTranslation } from "@/app/context/LanguageContext";

interface EquipmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    tool: {
        id: number;
        nama_alat: string;
        nama_kategori: string;
        stok: number;
        gambar: string;
        deskripsi: string;
    } | null;
    modalMode: 'detail' | 'borrow';
    setModalMode: (mode: 'detail' | 'borrow') => void;
    tanggalKembali: string;
    setTanggalKembali: (date: string) => void;
    handleBorrow: (e: React.FormEvent) => void;
    submitting: boolean;
    isAdmin?: boolean;
}

export function EquipmentDetailModal({
    isOpen,
    onClose,
    tool,
    modalMode,
    setModalMode,
    tanggalKembali,
    setTanggalKembali,
    handleBorrow,
    submitting,
    isAdmin = false
}: EquipmentDetailModalProps) {
    const { theme } = useTheme();
    const { t } = useTranslation();

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

    const translateCategory = (name: string) => {
        if (!name) return "";
        const key = `category_${name.toLowerCase().replace(/\s+/g, '_')}` as any;
        const translated = t(key);
        return translated === key ? name : translated;
    };

    if (!isOpen || !tool) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className={`rounded-3xl md:rounded-[52px] w-full max-w-4xl max-h-[90vh] md:h-[600px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-500 border flex flex-col lg:flex-row
                ${theme === 'dark' ? 'bg-(--card) border-white/5 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-3 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-md text-white transition-all hover:rotate-90 active:scale-90"
                >
                    <X size={20} />
                </button>

                {/* Left Side: Visuals */}
                <div className="lg:w-1/2 relative bg-slate-950 min-h-[220px] md:min-h-[300px] lg:min-h-0 overflow-hidden group shrink-0">
                    {tool.gambar ? (
                        <img
                            src={tool.gambar}
                            alt={tool.nama_alat}
                            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-800">
                            <Package size={100} strokeWidth={0.5} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 bg-brand-green text-black rounded-lg inline-block mb-4 shadow-lg shadow-emerald-500/20">
                            {translateCategory(tool.nama_kategori)}
                        </span>
                        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight">{translateName(tool.nama_alat)}</h2>
                        <div className="flex items-center gap-4 mt-4 opacity-60">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{t("stock")}: {tool.stok}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">ID: #{tool.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Content/Form */}
                <div className="lg:w-1/2 p-6 md:p-12 flex flex-col justify-between bg-inherit relative overflow-y-auto">
                    {modalMode === 'detail' ? (
                        <div className="space-y-8 md:space-y-10 animate-in slide-in-from-right-8 duration-500">
                            <div className="space-y-5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">{t("technical_narrative")}</label>
                                <div className="space-y-4">
                                    <p className="text-slate-400 font-medium leading-relaxed text-sm md:text-base antialiased">
                                        {translateDesc(tool.deskripsi, tool.nama_alat) || t("default_tool_desc")}
                                    </p>
                                    <div className="pt-2 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-white/5">{t("verified_condition")}</span>
                                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-white/5">{t("lab_secondary_asset")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-(--background)/50 border border-(--border) dark:border-white/5 group hover:bg-brand-green/5 hover:border-brand-green/20 transition-all duration-300">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{t("availability")}</p>
                                    <p className={`text-xl md:text-2xl font-black tracking-tighter ${tool.stok > 0 ? 'text-brand-green' : 'text-rose-500'}`}>
                                        {tool.stok} <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t("units")}</span>
                                    </p>
                                </div>
                                <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-(--background)/50 border border-(--border) dark:border-white/5 group hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all duration-300">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{t("status")}</p>
                                    <p className="text-xl md:text-2xl font-black text-indigo-500 tracking-tighter">
                                        {t("ready_to_use")} <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t("to_use")}</span>
                                    </p>
                                </div>
                            </div>

                            {!isAdmin && (
                                <div className="pt-4">
                                    <button
                                        onClick={() => setModalMode('borrow')}
                                        disabled={tool.stok === 0}
                                        className={`w-full py-6 font-black rounded-[28px] shadow-2xl transition-all flex items-center justify-center gap-4 text-lg hover:scale-[1.02] active:scale-95 group
                                            ${tool.stok > 0 ? 'bg-brand-green text-black shadow-emerald-500/30' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                    >
                                        {tool.stok > 0 ? (
                                            <>{t("proceed_borrow")} <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                                        ) : t("out_of_stock")}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in slide-in-from-left-8 duration-500 h-full flex flex-col">
                            <button
                                onClick={() => setModalMode('detail')}
                                className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-brand-green transition-colors w-fit group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t("back_to_specs")}
                            </button>

                            <div className="space-y-8 flex-1">
                                <div className="space-y-2">
                                    <h3 className="text-2xl md:text-3xl font-black tracking-tight">{t("plan_usage")}</h3>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{t("plan_usage_desc")}</p>
                                </div>

                                <form onSubmit={handleBorrow} className="space-y-6 md:space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t("scheduled_return")}</label>
                                        <div className="relative group/input">
                                            <Calendar size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-green group-focus-within/input:scale-110 transition-transform" />
                                            <input
                                                required
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                className={`w-full pl-16 pr-8 py-5 md:py-6 border-none rounded-[20px] md:rounded-[24px] focus:ring-8 focus:ring-brand-green/10 transition-all font-black text-base md:text-lg 
                                                    ${theme === 'dark' ? 'bg-(--background) text-white' : 'bg-slate-50 text-slate-800'}`}
                                                value={tanggalKembali}
                                                onChange={(e) => setTanggalKembali(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[24px] bg-amber-500/5 border border-amber-500/10 flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <Clock className="text-amber-600" size={20} />
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-500/80 leading-relaxed">
                                            {t("borrow_notice")}
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-5 md:py-6 bg-brand-green text-black font-black rounded-2xl md:rounded-[28px] shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-4 text-lg md:text-xl h-20 md:h-24 group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                        {submitting ? (
                                            <Loader2 className="animate-spin text-black" size={32} />
                                        ) : (
                                            <>{t("submit_request")} <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
