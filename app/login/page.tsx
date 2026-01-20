"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Star as StarIcon,
  Github,
  Facebook,
  ChevronRight,
  Hammer,
  Wrench,
  Key,
  ShieldCheck,
  User,
  Sparkles,
  Loader2
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import Link from "next/link";

export default function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      localStorage.setItem("role", data.role);
      localStorage.setItem("nama", data.nama);
      localStorage.setItem("username", data.username);

      if (data.role === "admin") {
        router.push("/admin");
      } else if (data.role === "petugas") {
        router.push("/petugas");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#f8fafc] overflow-hidden font-sans">
      {/* Left Side: Login Form */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-pink-500 to-blue-500" />

        <div>
          <Link href="/" className="text-2xl font-black flex items-center gap-3 text-blue-900 group w-fit">
            <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
              <Wrench size={22} />
            </div>
            <span>UKK <span className="text-pink-500">Inventory</span></span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto py-12">
          <div className="mb-10 space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-blue-900 tracking-tight leading-tight">
              {t('login_title')}
            </h2>
            <p className="text-slate-400 font-medium tracking-tight">Access your professional toolkit.</p>
          </div>

          <form onSubmit={login} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('search').split(' ')[0]}</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Enter your username"
                  className="w-full bg-slate-50 text-blue-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-100 focus:border-blue-500 transition-all font-bold placeholder:text-slate-300"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-black text-blue-500 hover:text-pink-500 uppercase tracking-widest transition-colors">Forgot?</a>
              </div>
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

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  SIGN IN <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-slate-300 text-[10px] font-black tracking-widest uppercase">Other ways</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <div className="flex justify-center gap-4">
              <SocialButton icon={<Github size={20} />} />
              <SocialButton icon={<Facebook size={20} className="text-blue-600" fill="currentColor" />} />
              <SocialButton icon={<GoogleIcon />} />
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-400 text-sm font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="text-pink-500 hover:text-blue-600 font-black transition-colors underline underline-offset-4">
              Create one now
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side: Visual Content */}
      <div className="hidden md:flex flex-1 items-center justify-center relative bg-linear-to-br from-blue-600 to-pink-500 p-12 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 blur-[100px] -mr-20 -mt-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300 opacity-10 blur-[100px] -ml-20 -mb-20" />

        <div className="relative w-full max-w-lg z-10">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[50px] shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-1000" />

            <div className="relative z-20 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-xs font-black text-white uppercase tracking-widest border border-white/10">
                <Sparkles size={14} className="text-pink-300" /> Member Testimonial
              </div>

              <h3 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                Borrow with <span className="text-blue-200">Confidence.</span>
              </h3>

              <div className="relative">
                <span className="absolute -top-6 -left-4 text-8xl text-white/10 font-serif leading-none">"</span>
                <p className="text-xl text-white/90 font-medium italic leading-relaxed relative z-10">
                  "Lending tools here is incredibly smooth. Search, click, and pick up. It's transformed how I manage my projects."
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-400 to-pink-400 border border-white/30 flex items-center justify-center text-white font-black text-xl shadow-lg">
                  MP
                </div>
                <div>
                  <p className="font-bold text-xl text-white">Mas Parjono</p>
                  <p className="text-white/60 text-sm font-bold uppercase tracking-wider">Project Lead @ BuildIt</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Card */}
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[32px] shadow-2xl max-w-[280px] z-30 animate-bounce-slow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-black text-blue-900 text-sm uppercase tracking-tighter">Verified Tech</h4>
                <p className="text-[10px] text-slate-400 font-bold leading-tight mt-0.5">Instant asset tracking & audit logs enabled.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-50 hover:border-blue-200 transition-all shadow-sm active:scale-90">
      {icon}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.90 3.28-2.10 4.36-1.50 1.28-3.70 1.96-6.44 1.96-5.04 0-9.14-3.66-9.14-8.16s4.10-8.16 9.14-8.16c2.81 0 4.85 1.11 6.19 2.4l2.23-2.23C18.14 2.25 15.36 1 12.48 1 c-6.45 0-11.69 5.25-11.69 11.69S5.30 24.38 11.69 24.38c3.22 0 6.04-1.06 8.24-3.22 2.12-2.12 3.32-5.46 3.32-8.36 0-1.12-.12-2.12-.32-2.88H12.48z" />
    </svg>
  );
}
