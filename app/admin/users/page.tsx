"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
    Users,
    Search,
    UserPlus,
    Edit2,
    Trash2,
    UserCircle,
    Loader2,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { useTranslation } from "@/app/context/LanguageContext";

function UsersContent() {
    const { showToast, showConfirm } = useNotification();
    const { t, language } = useTranslation();
    const [users, setUsers] = useState<Array<{
        id: number;
        nama: string;
        username: string;
        role: string;
        created_at: string;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        id: null as number | null,
        nama: "",
        username: "",
        password: "",
        role: "user"
    });

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const json = await res.json();
            if (json.success) {
                setUsers(json.data);
            } else {
                showToast(t("error_loading_data"), "error");
            }
        } catch (err) {
            console.error(err);
            showToast(t("connection_failed"), "error");
        } finally {
            setLoading(false);
        }
    };

    const searchParams = useSearchParams();

    useEffect(() => {
        fetchUsers();
        const search = searchParams.get("search");
        if (search) setSearchTerm(search);
    }, [searchParams]);

    const handleOpenModal = (user: any = null) => {
        if (user) {
            setFormData({ id: user.id, nama: user.nama, username: user.username, password: "", role: user.role });
        } else {
            setFormData({ id: null, nama: "", username: "", password: "", role: "user" });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        showToast(t("saving"), "loading");
        try {
            const isEdit = !!formData.id;
            const url = isEdit ? `/api/users/${formData.id}` : "/api/auth/register";
            const method = isEdit ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (res.ok && (json.success || !isEdit)) {
                showToast(isEdit ? t("user_updated") : t("user_registered"), "success");
                setShowModal(false);
                fetchUsers();
            } else {
                showToast(json.error || t("error_processing"), "error");
            }
        } catch (err) {
            console.error(err);
            showToast(t("system_error"), "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm(t("delete_user_title"), t("delete_user_desc"));
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                showToast(t("user_deleted"), "success");
                fetchUsers();
            } else {
                showToast(json.error || t("error_deleting"), "error");
            }
        } catch (err) {
            console.error(err);
            showToast(t("system_error"), "error");
        }
    };

    const filteredUsers = users.filter(user =>
        user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString() === searchTerm
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{t("access_control")}</div>
                        <span className="text-xs text-(--text-secondary) font-bold flex items-center gap-1"><Activity size={12} /> {t("live_user_monitoring")}</span>
                    </div>
                    <h1 className="text-5xl font-black text-(--text-primary) tracking-tighter">{t("user_directory")}</h1>
                </div>
                <Button onClick={() => handleOpenModal()} className="shadow-2xl shadow-blue-500/20 h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest transition-all active:scale-95">
                    <UserPlus className="mr-3 h-5 w-5" />
                    {t("add_user")}
                </Button>
            </div>

            {/* Metrics & Search Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 p-2 bg-(--card) border-(--border) shadow-xl rounded-[32px] overflow-hidden">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-(--text-secondary)" size={20} />
                            <Input
                                placeholder={t("search_users_placeholder")}
                                className="pl-16 h-16 border-0 bg-transparent focus-visible:ring-0 text-lg font-medium placeholder:text-(--text-secondary)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="px-6 h-12 flex items-center bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest mr-2">
                            {filteredUsers.length} {t("found")}
                        </div>
                    </div>
                </Card>

                <div className="bg-slate-900 rounded-[32px] p-6 text-white flex flex-col justify-center relative overflow-hidden group shadow-2xl shadow-blue-950/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{t("total_users")}</p>
                    <h2 className="text-4xl font-black italic">{users.length}</h2>
                </div>
            </div>

            {/* Database Table */}
            <Card className="overflow-hidden border-(--border) bg-(--card) shadow-2xl rounded-[40px]">
                {loading ? (
                    <div className="flex h-96 items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest animate-pulse">{t("loading")}</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-(--background) border-b border-(--border)">
                                    <th className="py-6 px-10 text-[10px] font-black text-(--text-secondary) uppercase tracking-[0.2em]">{t("name")}</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-(--text-secondary) uppercase tracking-[0.2em]">{t("role")}</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-(--text-secondary) uppercase tracking-[0.2em]">{t("registered_at")}</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-(--text-secondary) uppercase tracking-[0.2em] text-right">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border)">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-(--background) transition-all duration-300">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center text-blue-600 font-black text-xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                    {user.nama.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-(--text-primary) text-lg tracking-tight group-hover:text-blue-600 transition-colors">{user.nama}</p>
                                                    <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-wider">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <Badge variant={user.role === 'admin' ? 'default' : user.role === 'petugas' ? 'warning' : 'secondary'} className="h-8 px-4 font-black uppercase tracking-widest text-[9px] rounded-full">
                                                {t(`role_${user.role.toLowerCase()}` as any)}
                                            </Badge>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex flex-col">
                                                <span className="text-(--text-primary) font-black text-sm">
                                                    {new Date(user.created_at).toLocaleDateString(language === "jp" ? "ja-JP" : language === "en" ? "en-US" : language, {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric"
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-(--text-secondary) font-bold uppercase tracking-tighter">{t("authorized_member")}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-(--background) hover:bg-blue-100 hover:text-blue-600" onClick={() => handleOpenModal(user)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-(--background) hover:bg-pink-100 hover:text-pink-600" onClick={() => handleDelete(user.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <UserCircle className="w-20 h-20 text-(--text-secondary)" />
                                                <p className="text-sm font-black uppercase tracking-[0.3em] text-(--text-secondary)">{t("no_users_found")}</p>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <Card className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-300 bg-(--card) border-(--border) shadow-2xl rounded-[40px] overflow-hidden">
                        <CardHeader className="p-10 pb-6 border-b border-(--border)">
                            <CardTitle className="text-3xl font-black text-(--text-primary) tracking-tight">{formData.id ? t("edit_user") : t("add_user")}</CardTitle>
                            <CardDescription className="text-(--text-secondary) font-medium">{t("configure_user_access")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest ml-1">{t("full_name")}</label>
                                    <Input
                                        required
                                        placeholder={t("full_name_placeholder")}
                                        className="h-14 rounded-2xl bg-(--background) border-(--border) px-6 font-bold"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest ml-1">{t("username")}</label>
                                        <Input
                                            required
                                            placeholder="username"
                                            className="h-14 rounded-2xl bg-(--background) border-(--border) px-6 font-bold"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest ml-1">{t("role")}</label>
                                        <select
                                            className="w-full h-14 px-6 rounded-2xl border border-(--border) bg-(--background) text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--text-primary)"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="user">{t("role_user")}</option>
                                            <option value="petugas">{t("role_petugas")}</option>
                                            <option value="admin">{t("role_admin")}</option>
                                        </select>
                                    </div>
                                </div>
                                {(!formData.id || formData.password) && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest ml-1">{t("password")}</label>
                                        <Input
                                            required={!formData.id}
                                            type="password"
                                            placeholder={t("password_placeholder")}
                                            className="h-14 rounded-2xl bg-(--background) border-(--border) px-6 font-bold"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="pt-6 flex gap-3">
                                    <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={() => setShowModal(false)}>{t("cancel")}</Button>
                                    <Button type="submit" className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin" /> : t("save_changes")}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function ManageUsersPage() {
    const { t, language } = useTranslation();
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        }>
            <UsersContent />
        </Suspense>
    );
}
