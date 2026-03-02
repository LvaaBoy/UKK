"use client";

import React, { useEffect, useState } from "react";
import {
    Printer,
    ClipboardList,
    CheckCircle2,
    Clock,
    RotateCcw,
    DollarSign,
    Loader2,
    AlertTriangle,
    Filter,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/app/context/LanguageContext";

type LaporanStats = {
    total: number;
    pending: number;
    active: number;
    returned: number;
    totalDenda: number;
};

type LaporanRow = {
    id: number;
    nama_user: string;
    nama_alat: string;
    tanggal_pinjam: string;
    rencana_kembali: string;
    status: string;
    aktual_kembali: string | null;
    denda: number | null;
};

function getStatusVariant(status: string): "success" | "warning" | "destructive" | "secondary" {
    const s = status.toLowerCase();
    if (s === "disetujui") return "success";
    if (s === "pending" || s === "pending_kembali") return "warning";
    if (s === "ditolak") return "destructive";
    if (s === "kembali") return "secondary";
    return "secondary";
}

export default function PetugasLaporanPage() {
    const { t, language } = useTranslation();
    const [stats, setStats] = useState<LaporanStats | null>(null);
    const [data, setData] = useState<LaporanRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [printDate, setPrintDate] = useState("");

    useEffect(() => {
        setPrintDate(
            new Date().toLocaleDateString(language === "jp" ? "ja-JP" : language === "en" ? "en-US" : "id-ID", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
            })
        );
    }, [language]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/petugas/laporan");
                const json = await res.json();
                if (json.success) {
                    setStats(json.stats);
                    setData(json.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = filterStatus === "all"
        ? data
        : data.filter(d => d.status.toLowerCase() === filterStatus);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-12 text-center bg-(--card) rounded-[40px] border border-red-100 shadow-2xl mx-auto max-w-xl mt-20">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-(--text-primary) mb-2">{t("error")}</h2>
                <p className="text-(--text-secondary) mb-6">{t("connection_failed")}</p>
                <button onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all uppercase text-sm tracking-widest">
                    {t("try_again")}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Print Header — only visible when printing */}
            <div className="hidden print:block mb-10 border-b-2 border-slate-200 pb-6 text-center">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">
                    {t("staff_report_title")}
                </h1>
                <p className="text-slate-500 font-medium">{t("report_subtitle")}</p>
                <div className="mt-4 text-sm text-slate-400 font-bold">
                    {t("printed_on")} {printDate}
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5">
                            <ClipboardList size={10} /> {t("petugas_laporan")}
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-(--text-primary) tracking-tight">{t("staff_report_title")}</h1>
                    <p className="text-(--text-secondary) font-medium">{t("staff_report_desc")}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="hidden md:flex gap-2">
                        <Filter className="h-4 w-4" /> {t("filter")}
                    </Button>
                    <Button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20"
                    >
                        <Printer className="h-4 w-4" />
                        {t("print_report")}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:grid-cols-5">
                {[
                    { icon: ClipboardList, label: t("total_peminjaman"), value: stats.total, color: "blue" },
                    { icon: Clock, label: t("status_pending"), value: stats.pending, color: "amber" },
                    { icon: CheckCircle2, label: t("status_disetujui"), value: stats.active, color: "emerald" },
                    { icon: RotateCcw, label: t("status_kembali"), value: stats.returned, color: "slate" },
                    { icon: DollarSign, label: t("total_denda"), value: `Rp ${stats.totalDenda.toLocaleString("id-ID")}`, color: "pink" },
                ].map((s, i) => (
                    <Card key={i} className="p-5 rounded-3xl border-(--border) bg-(--card) shadow-xl group hover:shadow-2xl transition-all">
                        <div className={`w-10 h-10 rounded-2xl mb-3 flex items-center justify-center bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-500`}>
                            <s.icon size={18} />
                        </div>
                        <p className="text-2xl font-black text-(--text-primary) leading-tight">{s.value}</p>
                        <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest mt-1">{s.label}</p>
                    </Card>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap print:hidden">
                {[
                    { label: t("all"), value: "all" },
                    { label: t("status_pending"), value: "pending" },
                    { label: t("status_disetujui"), value: "disetujui" },
                    { label: t("status_kembali"), value: "kembali" },
                    { label: t("status_ditolak"), value: "ditolak" },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilterStatus(f.value)}
                        className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filterStatus === f.value
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                            : "bg-(--card) text-(--text-secondary) border border-(--border) hover:border-indigo-300"
                            }`}
                    >
                        {f.label} ({f.value === "all" ? data.length : data.filter(d => d.status.toLowerCase() === f.value).length})
                    </button>
                ))}
            </div>

            {/* Table */}
            <Card className="overflow-hidden border-(--border) bg-(--card) shadow-xl rounded-[32px] print:shadow-none print:border print:border-slate-200">
                <div className="p-6 border-b border-(--border) flex items-center justify-between print:hidden">
                    <h3 className="font-black text-xl text-(--text-primary) uppercase tracking-tight">{t("borrowing_audit")}</h3>
                    <span className="text-[10px] font-black text-(--text-secondary) bg-(--background) px-3 py-1.5 rounded-full uppercase tracking-widest">
                        {filtered.length} {t("records")}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-(--background) print:bg-slate-50">
                            <tr className="uppercase text-[10px] text-(--text-secondary) font-black tracking-[0.2em]">
                                <th className="px-6 py-5">ID</th>
                                <th className="px-6 py-5">{t("user")}</th>
                                <th className="px-6 py-5">{t("item")}</th>
                                <th className="px-6 py-5">{t("borrow_date")}</th>
                                <th className="px-6 py-5">{t("return_date")}</th>
                                <th className="px-6 py-5">{t("return_date_actual")}</th>
                                <th className="px-6 py-5">{t("status")}</th>
                                <th className="px-6 py-5">{t("fine")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--border) font-medium">
                            {filtered.length > 0 ? (
                                filtered.map((row) => (
                                    <tr key={row.id} className="hover:bg-(--background) transition-colors group print:hover:bg-transparent">
                                        <td className="px-6 py-4 font-mono text-xs text-(--text-secondary)">#{String(row.id).padStart(4, "0")}</td>
                                        <td className="px-6 py-4 font-bold text-(--text-primary) group-hover:text-indigo-600 transition-colors">{row.nama_user}</td>
                                        <td className="px-6 py-4 text-(--text-secondary)">{row.nama_alat}</td>
                                        <td className="px-6 py-4 text-(--text-secondary)">
                                            {row.tanggal_pinjam ? new Date(row.tanggal_pinjam).toLocaleDateString("id-ID") : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-(--text-secondary)">
                                            {row.rencana_kembali ? new Date(row.rencana_kembali).toLocaleDateString("id-ID") : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.aktual_kembali ? (
                                                <span className="text-emerald-500 font-bold">
                                                    {new Date(row.aktual_kembali).toLocaleDateString("id-ID")}
                                                </span>
                                            ) : (
                                                <span className="text-(--text-secondary)">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusVariant(row.status)} className="uppercase text-[10px] font-black">
                                                {row.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.denda != null && row.denda > 0 ? (
                                                <span className="font-bold text-red-500">Rp {row.denda.toLocaleString("id-ID")}</span>
                                            ) : (
                                                <span className="text-(--text-secondary)">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center text-(--text-secondary) font-black uppercase text-xs tracking-widest bg-(--background)">
                                        {t("no_activity_period")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Print Footer */}
            <div className="hidden print:block mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                <p className="font-bold">{t("report_subtitle")}</p>
                <p>{t("printed_on")} {printDate}</p>
            </div>

            {/* Print style */}
            <style>{`
        @media print {
          body * { visibility: hidden; }
          .max-w-7xl, .max-w-7xl * { visibility: visible; }
          .max-w-7xl { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
        </div>
    );
}
