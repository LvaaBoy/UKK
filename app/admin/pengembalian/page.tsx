"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
    Plus,
    Trash2,
    Edit2,
    Loader2,
    RotateCcw,
    Search,
    X,
    RefreshCw,
    AlertCircle,
    DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { useTranslation } from "@/app/context/LanguageContext";

type Pengembalian = {
    id: number;
    peminjaman_id: number;
    tanggal_kembali: string;
    denda: number;
    nama_user: string;
    nama_alat: string;
    tanggal_pinjam: string;
    tanggal_kembali_rencana: string;
    status_peminjaman: string;
};

type ActiveLoan = {
    id: number;
    nama_user: string;
    nama_alat: string;
    tanggal_kembali: string;
};

function PengembalianContent() {
    const { showToast, showConfirm } = useNotification();
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const [data, setData] = useState<Pengembalian[]>([]);
    const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        peminjaman_id: "",
        tanggal_kembali: "",
        denda: "0",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resPg, resPm] = await Promise.all([
                fetch("/api/admin/pengembalian"),
                fetch("/api/admin/peminjaman"),
            ]);
            const jsonPg = await resPg.json();
            const jsonPm = await resPm.json();
            if (jsonPg.success) setData(jsonPg.data);
            if (jsonPm.success) {
                setActiveLoans(
                    jsonPm.data
                        .filter((p: any) => p.status === "disetujui" || p.status === "pending_kembali")
                        .map((p: any) => ({
                            id: p.id,
                            nama_user: p.nama_user,
                            nama_alat: p.nama_alat,
                            tanggal_kembali: p.tanggal_kembali,
                        }))
                );
            }
        } catch (err) {
            console.error(err);
            showToast(t("connection_failed"), "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const search = searchParams.get("search");
        if (search) setSearchTerm(search);
    }, [searchParams]);

    const resetForm = () => {
        setEditingId(null);
        setFormData({ peminjaman_id: "", tanggal_kembali: "", denda: "0" });
    };

    // Auto-calculate denda based on selected loan & return date
    const handleLoanChange = (peminjamanId: string) => {
        setFormData(prev => ({ ...prev, peminjaman_id: peminjamanId, denda: "0" }));
        if (!peminjamanId) return;
        const loan = activeLoans.find(l => l.id.toString() === peminjamanId);
        if (loan && formData.tanggal_kembali) {
            const rencana = new Date(loan.tanggal_kembali);
            const aktual = new Date(formData.tanggal_kembali);
            const diff = Math.max(0, Math.floor((aktual.getTime() - rencana.getTime()) / (1000 * 60 * 60 * 24)));
            setFormData(prev => ({ ...prev, peminjaman_id: peminjamanId, denda: (diff * 5000).toString() }));
        }
    };

    const handleDateChange = (date: string) => {
        setFormData(prev => ({ ...prev, tanggal_kembali: date }));
        if (!formData.peminjaman_id) return;
        const loan = activeLoans.find(l => l.id.toString() === formData.peminjaman_id);
        if (loan && date) {
            const rencana = new Date(loan.tanggal_kembali);
            const aktual = new Date(date);
            const diff = Math.max(0, Math.floor((aktual.getTime() - rencana.getTime()) / (1000 * 60 * 60 * 24)));
            setFormData(prev => ({ ...prev, tanggal_kembali: date, denda: (diff * 5000).toString() }));
        }
    };

    const handleOpenModal = (item: Pengembalian | null = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                peminjaman_id: item.peminjaman_id.toString(),
                tanggal_kembali: item.tanggal_kembali?.split("T")[0] || "",
                denda: item.denda.toString(),
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        showToast(t("saving"), "loading");
        try {
            const body = {
                peminjaman_id: parseInt(formData.peminjaman_id),
                tanggal_kembali: formData.tanggal_kembali,
                denda: parseInt(formData.denda) || 0,
            };
            const url = editingId ? `/api/admin/pengembalian/${editingId}` : "/api/admin/pengembalian";
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (res.ok && json.success) {
                showToast(editingId ? t("pengembalian_updated") : t("pengembalian_added"), "success");
                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                showToast(json.error || t("system_error"), "error");
            }
        } catch {
            showToast(t("system_error"), "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm(t("delete_pengembalian_title"), t("delete_pengembalian_desc"));
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/admin/pengembalian/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (res.ok && json.success) {
                showToast(t("pengembalian_deleted"), "success");
                fetchData();
            } else {
                showToast(json.error || t("system_error"), "error");
            }
        } catch {
            showToast(t("system_error"), "error");
        }
    };

    const filtered = data.filter(item =>
        item.nama_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString() === searchTerm
    );

    const totalDenda = data.reduce((sum, item) => sum + (item.denda || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5">
                            <RotateCcw size={10} /> {t("pengembalian_management")}
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-(--text-primary) tracking-tighter">{t("pengembalian_management")}</h1>
                    <p className="text-(--text-secondary) font-medium mt-1">{t("pengembalian_management_desc")}</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/30 flex items-center gap-3"
                >
                    <Plus className="h-5 w-5" /> {t("add_pengembalian")}
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-(--card) border border-(--border) shadow-xl">
                    <p className="text-3xl font-black text-emerald-500">{data.length}</p>
                    <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest mt-1">{t("total_pengembalian")}</p>
                </div>
                <div className="p-6 rounded-3xl bg-(--card) border border-(--border) shadow-xl">
                    <p className="text-3xl font-black text-amber-500">{activeLoans.length}</p>
                    <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest mt-1">{t("active_loans")}</p>
                </div>
                <div className="p-6 rounded-3xl bg-(--card) border border-(--border) shadow-xl">
                    <p className="text-3xl font-black text-pink-500">Rp {totalDenda.toLocaleString("id-ID")}</p>
                    <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest mt-1">{t("total_denda")}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-secondary)" size={18} />
                <Input
                    placeholder={t("search")}
                    className="pl-12 h-14 rounded-2xl bg-(--card) border-(--border)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <Card className="rounded-[40px] border-none bg-(--card) shadow-2xl overflow-hidden">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-(--background) border-b border-(--border)">
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">ID</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">{t("user")}</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">{t("item")}</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">{t("borrow_date")}</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">{t("return_date_actual")}</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">{t("fine")}</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-(--text-secondary) text-right">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border)">
                                {filtered.map((item) => (
                                    <tr key={item.id} className="group hover:bg-(--background) transition-all">
                                        <td className="py-5 px-8 font-mono text-xs text-(--text-secondary)">#{String(item.id).padStart(4, "0")}</td>
                                        <td className="py-5 px-8">
                                            <p className="font-bold text-(--text-primary)">{item.nama_user}</p>
                                        </td>
                                        <td className="py-5 px-8">
                                            <p className="font-medium text-(--text-primary)">{item.nama_alat}</p>
                                        </td>
                                        <td className="py-5 px-8 text-sm text-(--text-secondary) font-medium">
                                            {item.tanggal_pinjam ? new Date(item.tanggal_pinjam).toLocaleDateString("id-ID") : "-"}
                                        </td>
                                        <td className="py-5 px-8 text-sm font-medium">
                                            <span className="text-emerald-500 font-bold">
                                                {item.tanggal_kembali ? new Date(item.tanggal_kembali).toLocaleDateString("id-ID") : "-"}
                                            </span>
                                        </td>
                                        <td className="py-5 px-8">
                                            {item.denda > 0 ? (
                                                <Badge variant="destructive" className="gap-1 font-black">
                                                    <DollarSign size={10} />
                                                    Rp {item.denda.toLocaleString("id-ID")}
                                                </Badge>
                                            ) : (
                                                <Badge variant="success" className="font-black text-[10px]">✓ Rp 0</Badge>
                                            )}
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost"
                                                    onClick={() => handleOpenModal(item)}
                                                    className="h-10 w-10 rounded-xl hover:text-emerald-600 hover:bg-emerald-50 border border-(--border)">
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button size="icon" variant="ghost"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="h-10 w-10 rounded-xl hover:text-red-600 hover:bg-red-50 border border-(--border)">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RotateCcw size={40} className="text-(--text-secondary) opacity-30" />
                                                <p className="font-black text-(--text-primary) text-lg">{t("no_data")}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-lg bg-(--card) rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 border-b border-(--border) flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-(--text-primary) tracking-tight">
                                        {editingId ? t("edit_pengembalian") : t("add_pengembalian")}
                                    </h3>
                                    <p className="text-(--text-secondary) text-sm font-medium mt-1">{t("pengembalian_management_desc")}</p>
                                </div>
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="h-10 w-10 rounded-2xl flex items-center justify-center hover:bg-(--background) text-(--text-secondary) transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Select Active Loan */}
                                {!editingId && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">{t("select_loan")}</label>
                                        {activeLoans.length === 0 ? (
                                            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-700">
                                                <AlertCircle size={18} className="text-amber-500 shrink-0" />
                                                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{t("no_active_loans")}</p>
                                            </div>
                                        ) : (
                                            <select required
                                                className="w-full h-14 px-5 rounded-2xl border-2 border-(--border) focus:border-emerald-500 focus:outline-none font-medium text-(--text-primary) bg-(--background)"
                                                value={formData.peminjaman_id}
                                                onChange={e => handleLoanChange(e.target.value)}
                                            >
                                                <option value="">{t("select_loan")}</option>
                                                {activeLoans.map(l => (
                                                    <option key={l.id} value={l.id}>
                                                        #{l.id} — {l.nama_user} · {l.nama_alat}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}

                                {/* Return Date */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">{t("return_date_actual")}</label>
                                    <Input required type="date"
                                        className="h-14 px-5 rounded-2xl border-(--border) font-medium"
                                        value={formData.tanggal_kembali}
                                        onChange={e => handleDateChange(e.target.value)}
                                    />
                                </div>

                                {/* Denda */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">{t("fine")} (Rp)</label>
                                    <Input type="number" min="0"
                                        className="h-14 px-5 rounded-2xl border-(--border) font-black text-lg"
                                        value={formData.denda}
                                        onChange={e => setFormData({ ...formData, denda: e.target.value })}
                                    />
                                    <p className="text-xs text-(--text-secondary) font-medium">
                                        {t("fine_calc_note")}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 pt-0 flex gap-4">
                                <Button type="button" variant="ghost" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 h-14 rounded-2xl font-bold text-(--text-secondary)"
                                    disabled={submitting}>
                                    {t("cancel")}
                                </Button>
                                <Button disabled={submitting || (!editingId && activeLoans.length === 0)}
                                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">
                                    {submitting ? <RefreshCw className="animate-spin" size={18} /> : (editingId ? t("update") : t("confirm_return"))}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PengembalianAdminPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
            </div>
        }>
            <PengembalianContent />
        </Suspense>
    );
}
