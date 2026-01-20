"use client";
import React, { useEffect, useState } from "react";
import {
    Users,
    Search,
    UserPlus,
    ShieldCheck,
    ShieldAlert,
    AtSign,
    Calendar,
    Loader2,
    Edit2,
    Trash2,
    CheckCircle2,
    Key,
    UserCircle
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
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
        role: "peminjam"
    });

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user: any = null) => {
        if (user) {
            setFormData({
                id: user.id,
                nama: user.nama,
                username: user.username,
                password: "", // Don't show password for edit
                role: user.role
            });
        } else {
            setFormData({ id: null, nama: "", username: "", password: "", role: "peminjam" });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const isEdit = !!formData.id;
            const url = isEdit ? `/api/users/${formData.id}` : "/api/auth/register";
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowModal(false);
                fetchUsers();
            } else {
                const errData = await res.json();
                alert(errData.error || "Terjadi kesalahan");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus pengguna ini? Tindakan ini tidak dapat dibatalkan.")) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (res.ok) fetchUsers();
            else {
                const errData = await res.json();
                alert(errData.error || "Gagal menghapus user");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(user =>
        user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { theme } = useTheme();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Manajemen Pengguna</h1>
                    <p className="text-slate-500 text-sm mt-1">Kelola data admin, petugas, dan anggota sistem.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-brand-green hover:bg-opacity-90 text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <UserPlus size={20} />
                    Tambah Pengguna
                </button>
            </div>

            <div className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 transition-colors ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border)' : 'bg-white border-slate-100'}`}>
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama atau username..."
                        className={`w-full pl-12 pr-4 py-2.5 border-none rounded-xl focus:ring-2 focus:ring-brand-green transition-all 
                            ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-800'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
                </div>
            ) : (
                <div className={`rounded-[32px] border shadow-sm overflow-hidden transition-colors ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border)' : 'bg-white border-slate-100'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-50">
                                <tr>
                                    <th className="py-6 px-8">PENGGUNA</th>
                                    <th className="py-6 px-4">ROLE</th>
                                    <th className="py-6 px-4">BERGABUNG</th>
                                    <th className="py-6 px-4">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 font-bold group-hover:bg-brand-green/20 group-hover:text-brand-green transition-all uppercase
                                                    ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                                                    {user.nama.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{user.nama}</p>
                                                    <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-xs">
                                                        <AtSign size={10} />
                                                        <span>{user.username}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 font-bold uppercase tracking-wider text-[10px]">
                                            <div className={`items-center gap-1.5 px-3 py-1.5 rounded-full inline-flex ${user.role === 'admin' ? 'bg-brand-green/10 text-brand-card' :
                                                user.role === 'petugas' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {user.role === 'admin' ? <ShieldCheck size={12} /> :
                                                    user.role === 'petugas' ? <ShieldAlert size={12} /> : <Users size={12} />}
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 text-slate-400 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleOpenModal(user)} className={`p-2 rounded-lg transition-colors
                                                    ${theme === 'dark' ? 'text-slate-400 hover:text-brand-green hover:bg-white/5' : 'text-slate-400 hover:text-brand-green hover:bg-emerald-50'}`}>
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className={`p-2 rounded-lg transition-colors
                                                    ${theme === 'dark' ? 'text-slate-400 hover:text-red-500 hover:bg-white/5' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className={`rounded-[40px] w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-200 border
                        ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border) text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green shrink-0">
                                {formData.id ? <Edit2 size={20} /> : <UserPlus size={20} />}
                            </div>
                            {formData.id ? "Edit User" : "Tambah User"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                <div className="relative">
                                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        required
                                        className={`w-full pl-12 pr-5 py-4 border-none rounded-2xl focus:ring-2 focus:ring-brand-green transition-all font-medium placeholder:text-slate-300
                                            ${theme === 'dark' ? 'bg-white/5 text-white shadow-none' : 'bg-slate-50 text-slate-800'}`}
                                        placeholder="Nama lengkap..."
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                                <div className="relative">
                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        required
                                        className={`w-full pl-12 pr-5 py-4 border-none rounded-2xl focus:ring-2 focus:ring-brand-green transition-all font-medium placeholder:text-slate-300
                                            ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-800'}`}
                                        placeholder="Username unik..."
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            {!formData.id && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            required
                                            type="password"
                                            className={`w-full pl-12 pr-5 py-4 border-none rounded-2xl focus:ring-2 focus:ring-brand-green transition-all font-medium placeholder:text-slate-300
                                                ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-800'}`}
                                            placeholder="Minimal 6 karakter..."
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Akses Role</label>
                                <select
                                    className={`w-full px-5 py-4 border-none rounded-2xl focus:ring-2 focus:ring-brand-green transition-all font-bold appearance-none shadow-sm
                                        ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-800'}`}
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="peminjam" className={theme === 'dark' ? "bg-[#111b17] text-white" : ""}>User / Member</option>
                                    <option value="petugas" className={theme === 'dark' ? "bg-[#111b17] text-white" : ""}>Petugas Lab</option>
                                    <option value="admin" className={theme === 'dark' ? "bg-[#111b17] text-white" : ""}>Administrator</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-4 font-bold rounded-2xl transition-all 
                                    ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                    Batal
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-brand-green text-black font-bold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} className="text-black" />}
                                    {formData.id ? "Update" : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }
        </div >
    );
}
