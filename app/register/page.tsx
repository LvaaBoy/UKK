"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    ArrowLeft,
    Star,
    Github,
    Facebook,
    Wrench,
    User,
    AtSign,
    Key,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const [nama, setNama] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Password tidak cocok!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama, username, password, role: "peminjam" }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Gagal melakukan registrasi");
                return;
            }

            alert("Registrasi berhasil! Silakan login.");
            router.push("/login");
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan saat registrasi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-brand-dark text-white overflow-hidden font-sans">
            {/* Left Side: Register Form */}
            <div className="flex-1 flex flex-col justify-between p-8 md:p-12 lg:p-20 overflow-y-auto">
                <div>
                    <Link href="/login" className="text-xl font-bold flex items-center gap-2 group w-fit">
                        <span className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                            <Wrench size={18} />
                        </span>
                        Peminjaman Alat
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto py-10">
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-semibold mb-2">Create your account</h2>
                        <p className="text-gray-400 text-sm">Join us to start borrowing high-quality tools.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-green transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full bg-white text-black pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green border-none transition-all placeholder:text-gray-300"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                            <div className="relative">
                                <AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-green transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Pilih username unik"
                                    className="w-full bg-white text-black pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green border-none transition-all placeholder:text-gray-300"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-green transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white text-black pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green border-none transition-all placeholder:text-gray-300"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Konfirmasi Password</label>
                            <div className="relative">
                                <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-green transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white text-black pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green border-none transition-all placeholder:text-gray-300"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-brand-green hover:bg-opacity-90 text-black font-extrabold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95"
                        >
                            {loading ? "Creating account..." : "Register Now"}
                            <ArrowRight size={20} />
                        </button>
                    </form>
                </div>

                <div className="text-center">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-brand-green hover:text-white font-bold transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side: Visual Content (Matched with Login) */}
            <div className="hidden md:flex flex-1 p-8 items-center justify-center relative bg-linear-to-br from-brand-dark to-[#0f1a16]">
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-green opacity-5 blur-[100px]"></div>

                <div className="relative w-full max-w-lg z-10">
                    <div className="bg-brand-card p-10 rounded-[40px] relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Wrench size={100} className="rotate-45" />
                        </div>

                        <div className="relative z-20">
                            <h3 className="text-4xl lg:text-5xl font-bold leading-tight mb-8">
                                Ready to build something great?
                            </h3>

                            <div className="flex items-start gap-4 mb-8">
                                <span className="text-5xl leading-none font-serif text-brand-green">"</span>
                                <div>
                                    <p className="text-lg text-white text-opacity-90 italic">
                                        "Sistem inventaris ini sangat transparan. Saya bisa melihat ketersediaan alat secara real-time sebelum berangkat ke Lab."
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 border-l-4 border-brand-green pl-4">
                                <p className="font-bold text-xl">Syarifuddin</p>
                                <p className="text-white text-opacity-70 text-sm">Senior Architect at UrbanPlan</p>
                            </div>

                            <div className="flex gap-4 mt-10">
                                <div className="w-12 h-12 bg-white/5 backdrop-blur-md text-white rounded-xl flex items-center justify-center border border-white/10">
                                    <ArrowLeft size={20} />
                                </div>
                                <div className="w-12 h-12 bg-brand-green text-black rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -bottom-6 -left-6 bg-white text-black p-6 rounded-3xl shadow-2xl max-w-[280px] z-30">
                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-brand-green text-black rounded-full flex items-center justify-center border-4 border-brand-dark shadow-lg">
                            <ShieldCheck size={20} />
                        </div>

                        <h4 className="font-extrabold text-sm mb-2 uppercase tracking-tight">Verifikasi Cepat</h4>
                        <p className="text-gray-500 text-[10px] leading-relaxed mb-4 font-bold">
                            Akun anda akan diverifikasi dalam hitungan menit untuk akses alat lab secepat mungkin.
                        </p>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-green w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
