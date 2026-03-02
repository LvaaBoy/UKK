"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
    Plus,
    Trash2,
    Edit2,
    Loader2,
    ClipboardList,
    Search,
    X,
    RefreshCw,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { useTranslation } from "@/app/context/LanguageContext";

type Peminjaman = {
    id: number;
    user_id: number;
    nama_user: string;
    alat_id: number;
    nama_alat: string;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    status: string;
};

type UserOption = { id: number; nama: string };
type AlatOption = { id: number; nama_alat: string; stok: number };

const STATUS_OPTIONS = ["pending", "disetujui", "ditolak", "kembali", "pending_kembali"];

function getStatusVariant(status: string): "success" | "warning" | "destructive" | "secondary" {
    const s = status.toLowerCase();
    if (s === "disetujui") return "success";
    if (s === "pending" || s === "pending_kembali") return "warning";
    if (s === "ditolak") return "destructive";
    return "secondary";
}

function getStatusIcon(status: string) {
    const s = status.toLowerCase();
    if (s === "disetujui") return <CheckCircle2 size={12} />;
    if (s === "pending" || s === "pending_kembali") return <Clock size={12} />;
    if (s === "ditolak") return <XCircle size={12} />;
    if (s === "kembali") return <RotateCcw size={12} />;
    return null;
}

function PeminjamanContent() {
    const { showToast, showConfirm } = useNotification();
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const [data, setData] = useState<Peminjaman[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [alat, setAlat] = useState<AlatOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        user_id: "",
        alat_id: "",
        tanggal_pinjam: "",
        tanggal_kembali: "",
        status: "pending",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resP, resU, resA] = await Promise.all([
                fetch("/api/admin/peminjaman"),
                fetch("/api/users"),
                fetch("/api/alat"),
            ]);
            const jsonP = await resP.json();
            const jsonU = await resU.json();
            const jsonA = await resA.json();
            if (jsonP.success) setData(jsonP.data);
            if (jsonU.success) setUsers(jsonU.data);
            if (jsonA.success) setAlat(jsonA.data);
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
        setFormData({ user_id: "", alat_id: "", tanggal_pinjam: "", tanggal_kembali: "", status: "pending" });
    };

    const handleOpenModal = (item: Peminjaman | null = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                user_id: item.user_id.toString(),
                alat_id: item.alat_id.toString(),
                tanggal_pinjam: item.tanggal_pinjam?.split("T")[0] || "",
                tanggal_kembali: item.tanggal_kembali?.split("T")[0] || "",
                status: item.status,
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
            const url = editingId ? `/api/admin/peminjaman/${editingId}` : "/api/admin/peminjaman";
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (res.ok && json.success) {
                showToast(editingId ? t("peminjaman_updated") : t("peminjaman_added"), "success");
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
        const confirmed = await showConfirm(t("delete_peminjaman_title"), t("delete_peminjaman_desc"));
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/admin/peminjaman/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (res.ok && json.success) {
                showToast(t("peminjaman_deleted"), "success");
                fetchData();
            } else {
                showToast(json.error || t("system_error"), "error");
            }
        } catch {
            showToast(t("system_error"), "error");
        }
    };

    const filtered = data.filter(item => {
        const matchSearch =
            item.nama_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toString() === searchTerm;
        const matchStatus = filterStatus === "all" || item.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = data.filter(d => d.status === s).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5">
                            <ClipboardList size={10} /> {t("peminjaman_management")}
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-(--text-primary) tracking-tighter">{t("peminjaman_management")}</h1>
                    <p className="text-(--text-secondary) font-medium mt-1">{t("peminjaman_management_desc")}</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/30 flex items-center gap-3"
                >
                    <Plus className="h-5 w-5" /> {t("add_peminjaman")}
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: t("all"), value: data.length, color: "blue", key: "all" },
                    { label: t("status_pending"), value: statusCounts["pending"] || 0, color: "amber", key: "pending" },
                    { label: t("status_disetujui"), value: statusCounts["disetujui"] || 0, color: "emerald", key: "disetujui" },
                    { label: t("status_ditolak"), value: statusCounts["ditolak"] || 0, color: "red", key: "ditolak" },
                    { label: t("status_kembali"), value: statusCounts["kembali"] || 0, color: "slate", key: "kembali" },
                ].map((s) => (
                    <button
                        key={s.key}
                        onClick={() => setFilterStatus(s.key)}
                        className={`p-5 rounded-3xl border text-left transition-all hover:shadow-lg ${filterStatus === s.key
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20"
                            : "border-(--border) bg-(--card)"
                            }`}
                    >
                        <p className={`text-3xl font-black text-${s.color}-500`}>{s.value}</p>
                        <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest mt-1">{s.label}</p>
                    </button>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-secondary)" size={18} />
                    <Input
                        placeholder={t("search")}
                        className="pl-12 h-14 rounded-2xl bg-(--card) border-(--border)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="h-14 px-5 rounded-2xl border-2 border-(--border) bg-(--card) text-(--text-primary) font-bold focus:border-blue-500 focus:outline-none"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">{t("all_status")}</option>
                    {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <Card className="rounded-[40px] border-none bg-(--card) shadow-2xl overflow-hidden">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">{t("return_date")}</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">{t("status")}</th>
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
                                        <td className="py-5 px-8 text-sm text-(--text-secondary) font-medium">
                                            {item.tanggal_kembali ? new Date(item.tanggal_kembali).toLocaleDateString("id-ID") : "-"}
                                        </td>
                                        <td className="py-5 px-8">
                                            <Badge variant={getStatusVariant(item.status)} className="gap-1 uppercase text-[10px] font-black">
                                                {getStatusIcon(item.status)}
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost"
                                                    onClick={() => handleOpenModal(item)}
                                                    className="h-10 w-10 rounded-xl hover:text-blue-600 hover:bg-blue-50 border border-(--border)">
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
                                                <ClipboardList size={40} className="text-(--text-secondary) opacity-30" />
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
                                        {editingId ? t("edit_peminjaman") : t("add_peminjaman")}
                                    </h3>
                                    <p className="text-(--text-secondary) text-sm font-medium mt-1">{t("peminjaman_management_desc")}</p>
                                </div>
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="h-10 w-10 rounded-2xl flex items-center justify-center hover:bg-(--background) text-(--text-secondary) transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* User */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">{t("user")}</label>
                                    <select required
                                        className="w-full h-14 px-5 rounded-2xl border-2 border-(--border) focus:border-blue-500 focus:outline-none font-medium text-(--text-primary) bg-(--background)"
                                        value={formData.user_id}
                                        onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                        disabled={!!editingId}
                                    >
                                        <option value="">{t("select_user")}</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.nama}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Alat */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">{t("item")}</label>
                                    <select required
                                        className="w-full h-14 px-5 rounded-2xl border-2 border-(--border) focus:border-blue-500 focus:outline-none font-medium text-(--text-primary) bg-(--background)"
                                        value={formData.alat_id}
                                        onChange={e => setFormData({ ...formData, alat_id: e.target.value })}
                                        disabled={!!editingId}
                                    >
                                        <option value="">{t("select_item")}</option>
                                        {alat.map(a => (
                                            <option key={a.id} value={a.id}>{a.nama_alat} (stok: {a.stok})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">{t("borrow_date")}</label>
                                        <Input required type="date"
                                            className="h-14 px-5 rounded-2xl border-(--border) font-medium"
                                            value={formData.tanggal_pinjam}
                                            onChange={e => setFormData({ ...formData, tanggal_pinjam: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">{t("return_date")}</label>
                                        <Input required type="date"
                                            className="h-14 px-5 rounded-2xl border-(--border) font-medium"
                                            value={formData.tanggal_kembali}
                                            onChange={e => setFormData({ ...formData, tanggal_kembali: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary)">{t("status")}</label>
                                    <select
                                        className="w-full h-14 px-5 rounded-2xl border-2 border-(--border) focus:border-blue-500 focus:outline-none font-medium text-(--text-primary) bg-(--background)"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        {STATUS_OPTIONS.map(s => (
                                            <option key={s} value={s}>{s.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-8 pt-0 flex gap-4">
                                <Button type="button" variant="ghost" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 h-14 rounded-2xl font-bold text-(--text-secondary)"
                                    disabled={submitting}>
                                    {t("cancel")}
                                </Button>
                                <Button disabled={submitting}
                                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">
                                    {submitting ? <RefreshCw className="animate-spin" size={18} /> : (editingId ? t("update") : t("create"))}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PeminjamanAdminPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        }>
            <PeminjamanContent />
        </Suspense>
    );
}
