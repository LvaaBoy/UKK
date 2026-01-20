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
    ShieldCheck,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import Link from "next/link";

export default function RegisterPage() {
    const { t } = useTranslation();
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
        <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#f8fafc] overflow-hidden font-sans">
            {/* Left Side: Register Form */}
            <div className="flex-1 flex flex-col justify-between p-8 md:p-12 lg:p-20 bg-white relative overflow-y-auto">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-pink-500 via-blue-500 to-pink-500" />

                <div>
                    <Link href="/login" className="text-2xl font-black flex items-center gap-3 text-blue-900 group w-fit">
                        <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200 group-hover:-rotate-12 transition-transform">
                            <Wrench size={22} />
                        </div>
                        <span>UKK <span className="text-blue-500">Inventory</span></span>
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto py-10">
                    <div className="mb-10 space-y-2">
                        <h2 className="text-3xl md:text-4xl font-black text-blue-900 tracking-tight leading-tight">
                            {t('register_title')}
                        </h2>
                        <p className="text-slate-400 font-medium tracking-tight">Join the network and start building.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full bg-slate-50 text-blue-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-100 focus:border-blue-500 transition-all font-bold placeholder:text-slate-300"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative group">
                                <AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Choose unique username"
                                    className="w-full bg-slate-50 text-blue-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-100 focus:border-blue-500 transition-all font-bold placeholder:text-slate-300"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 text-blue-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-100 focus:border-blue-500 transition-all font-bold placeholder:text-slate-300"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                            <div className="relative group">
                                <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 text-blue-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-100 focus:border-blue-500 transition-all font-bold placeholder:text-slate-300"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-blue-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10 active:scale-95 group mt-4"
                        >
                            {loading ? "PROCESSING..." : (
                                <>
                                    REGISTER ACCOUNT <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 hover:text-pink-500 font-black transition-colors underline underline-offset-4">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side: Visual Content (Matched with Login) */}
            <div className="hidden md:flex flex-1 p-8 items-center justify-center relative bg-linear-to-br from-pink-500 to-blue-600 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />

                <div className="relative w-full max-w-lg z-10">
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[50px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-45 transition-transform duration-1000">
                            <Wrench size={120} />
                        </div>

                        <div className="relative z-20 space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-xs font-black text-white uppercase tracking-widest border border-white/10">
                                <Sparkles size={14} className="text-blue-300" /> Community Note
                            </div>

                            <h3 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                                Build <span className="text-pink-200">Better</span> Together.
                            </h3>

                            <div className="relative">
                                <span className="absolute -top-6 -left-4 text-8xl text-white/10 font-serif leading-none">"</span>
                                <p className="text-xl text-white/90 font-medium italic leading-relaxed relative z-10">
                                    "The inventory transparency here is revolutionary. I can plan my entire lab workflow from home."
                                </p>
                            </div>

                            <div className="mt-8 border-l-4 border-pink-400 pl-6 space-y-1">
                                <p className="font-bold text-2xl text-white">Syarifuddin</p>
                                <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Senior Architect @ UrbanPlan</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-[32px] shadow-2xl max-w-[280px] z-30 animate-bounce-slow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-blue-900 text-sm uppercase tracking-tight">Rapid Entry</h4>
                                <p className="text-[10px] text-slate-400 font-bold leading-tight mt-1">Get verified in minutes for instant lab access.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
