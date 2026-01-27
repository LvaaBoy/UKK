"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
    Users,
    Search,
    UserPlus,
    Edit2,
    Trash2,
    CheckCircle2,
    Key,
    UserCircle,
    AtSign,
    Loader2,
    MoreHorizontal,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";

function UsersContent() {
    const { showToast, showConfirm } = useNotification();
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

    // Form State
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
                console.error("Failed to fetch users:", json.error);
                showToast("Gagal memuat daftar pengguna.", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Koneksi gagal.", "error");
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
            setFormData({
                id: user.id,
                nama: user.nama,
                username: user.username,
                password: "",
                role: user.role
            });
        } else {
            setFormData({ id: null, nama: "", username: "", password: "", role: "user" });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        showToast(`${formData.id ? 'Memperbarui' : 'Mendaftarkan'} pengguna...`, "loading");
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
                showToast(`Pengguna berhasil ${isEdit ? 'diperbarui' : 'terdaftar'}!`, "success");
                setShowModal(false);
                fetchUsers();
            } else {
                showToast(json.error || "Gagal memproses permintaan", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Terjadi kesalahan sistem.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm(
            "Hapus Pengguna?",
            "Tindakan ini akan menghapus akun pengguna secara permanen dari sistem."
        );
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                showToast("Pengguna berhasil dihapus.", "success");
                fetchUsers();
            } else {
                showToast(json.error || "Gagal menghapus pengguna", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Terjadi kesalahan saat menghapus.", "error");
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
                        <div className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Access Control</div>
                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><Activity size={12} /> Live user database monitoring</span>
                    </div>
                    <h1 className="text-5xl font-black text-blue-900 tracking-tighter">User Directory</h1>
                </div>
                <Button onClick={() => handleOpenModal()} className="shadow-2xl shadow-blue-500/20 h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest transition-all active:scale-95">
                    <UserPlus className="mr-3 h-5 w-5" />
                    Provision New User
                </Button>
            </div>

            {/* Metrics & Search Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 p-2 bg-white/80 backdrop-blur-xl border-slate-100 shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <Input
                                placeholder="Filter by identity or handle..."
                                className="pl-16 h-16 border-0 bg-transparent focus-visible:ring-0 text-lg font-medium placeholder:text-slate-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="px-6 h-12 flex items-center bg-blue-50 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest mr-2">
                            {filteredUsers.length} Nodes Found
                        </div>
                    </div>
                </Card>

                <div className="bg-slate-900 rounded-[32px] p-6 text-white flex flex-col justify-center relative overflow-hidden group shadow-2xl shadow-blue-950/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Capacity</p>
                    <h2 className="text-4xl font-black italic">{users.length}</h2>
                </div>
            </div>

            {/* Database Table */}
            <Card className="overflow-hidden border-slate-100 bg-white shadow-2xl shadow-slate-200/40 rounded-[40px]">
                {loading ? (
                    <div className="flex h-96 items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing directory...</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Node</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Level</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registration</th>
                                    <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-blue-50/20 transition-all duration-300">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-black text-xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                    {user.nama.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">{user.nama}</p>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <Badge variant={user.role === 'admin' ? 'default' : user.role === 'petugas' ? 'warning' : 'secondary'} className="h-8 px-4 font-black uppercase tracking-widest text-[9px] rounded-full">
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-black text-sm">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Authorized Member</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-blue-100 hover:text-blue-600" onClick={() => handleOpenModal(user)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-pink-100 hover:text-pink-600" onClick={() => handleDelete(user.id)}>
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
                                                <UserCircle className="w-20 h-20 text-slate-300" />
                                                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">No identity matching criteria</p>
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
                    <Card className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-300 bg-white border-white/20 shadow-2xl rounded-[40px] overflow-hidden">
                        <CardHeader className="p-10 pb-6 border-b border-slate-50">
                            <CardTitle className="text-3xl font-black text-blue-900 tracking-tight">{formData.id ? "Alter Identity" : "Provision Node"}</CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Configure system access and identity parameters.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                                    <Input
                                        required
                                        placeholder="Full system name"
                                        className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 px-6 font-bold"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Handle</label>
                                        <Input
                                            required
                                            placeholder="username"
                                            className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 px-6 font-bold"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Level</label>
                                        <select
                                            className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="user">User / Member</option>
                                            <option value="petugas">Petugas (Staff)</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                </div>
                                {(!formData.id || formData.password) && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Token</label>
                                        <Input
                                            required={!formData.id}
                                            type="password"
                                            placeholder="Security passphrase"
                                            className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 px-6 font-bold"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="pt-6 flex gap-3">
                                    <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={() => setShowModal(false)}>Abort</Button>
                                    <Button type="submit" className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin" /> : "Commit Changes"}
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

export default function UsersPage() {
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

