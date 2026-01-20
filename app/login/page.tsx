"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Star,
  Github,
  Facebook,
  ChevronRight,
  Hammer,
  Wrench,
  Key
} from "lucide-react";

export default function LoginPage() {
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
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#090e0c] text-white overflow-hidden font-sans">
      {/* Left Side: Login Form */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-black">
              <Wrench size={18} />
            </span>
            Peminjaman Alat
          </h1>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Please Enter your Account details</h2>
            <p className="text-gray-400 text-sm">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={login} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
              <input
                required
                type="text"
                placeholder="Masukkan username anda"
                className="w-full bg-white text-black px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green border-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-white text-black px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green border-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-gray-400 hover:text-white underline underline-offset-4 decoration-gray-600 transition-colors">
                Forgot Password
              </a>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-brand-green hover:bg-opacity-90 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-[1px] bg-gray-800"></div>
              <span className="text-gray-500 text-xs">OR LOGIN WITH</span>
              <div className="flex-1 h-[1px] bg-gray-800"></div>
            </div>

            <div className="flex justify-center gap-4 text-black">
              <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.90 3.28-2.10 4.36-1.50 1.28-3.70 1.96-6.44 1.96-5.04 0-9.14-3.66-9.14-8.16s4.10-8.16 9.14-8.16c2.81 0 4.85 1.11 6.19 2.4l2.23-2.23C18.14 2.25 15.36 1 12.48 1 c-6.45 0-11.69 5.25-11.69 11.69S5.30 24.38 11.69 24.38c3.22 0 6.04-1.06 8.24-3.22 2.12-2.12 3.32-5.46 3.32-8.36 0-1.12-.12-2.12-.32-2.88H12.48z" />
                </svg>
              </button>
              <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-all">
                <Github size={20} />
              </button>
              <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-all">
                <Facebook size={20} className="text-blue-600" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-brand-green hover:text-white font-bold transition-colors">
              Create an account
            </a>
          </p>
        </div>
      </div>

      {/* Right Side: Visual Content */}
      <div className="hidden md:flex flex-1 p-8 items-center justify-center relative bg-gradient-to-br from-[#090e0c] to-[#0f1a16]">
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-green opacity-5 blur-[100px]"></div>

        <div className="relative w-full max-w-lg z-10">
          <div className="bg-brand-card p-10 rounded-[40px] relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Wrench size={100} className="rotate-45" />
            </div>

            <div className="relative z-20">
              <h3 className="text-4xl lg:text-5xl font-bold leading-tight mb-8">
                What's our Jobseekers Said.
              </h3>

              <div className="flex items-start gap-4 mb-8">
                <span className="text-5xl leading-none font-serif">"</span>
                <div>
                  <p className="text-lg text-white text-opacity-90 italic">
                    "Meminjam alat di sini sekarang jauh lebih mudah dari sebelumnya.
                    Cukup cari, klik, dan ambil. Sangat membantu pekerjaan proyek saya."
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <p className="font-bold text-xl">Mas Parjono</p>
                <p className="text-white text-opacity-70 text-sm">Project Manager at BuildIt</p>
              </div>

              <div className="flex gap-4 mt-8">
                <button className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:bg-brand-green transition-all">
                  <ArrowLeft size={20} />
                </button>
                <button className="w-12 h-12 bg-[#1a2e26] text-white rounded-xl flex items-center justify-center hover:bg-brand-dark transition-all">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-12 -left-6 bg-white text-black p-6 rounded-3xl shadow-2xl max-w-[320px] z-30">
            {/* Floating star icon */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-brand-dark text-white rounded-full flex items-center justify-center border-4 border-[#090e0c]">
              <Star size={20} fill="currentColor" className="text-white" />
            </div>

            <h4 className="font-bold text-lg mb-2">Pinjam alat lebih cepat & tepat sekarang</h4>
            <p className="text-gray-500 text-xs leading-relaxed mb-4">
              Pendaftaran mudah dan verifikasi instan. Nikmati kemudahan akses alat berkualitas untuk setiap kebutuhanmu.
            </p>
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="avatar" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-dark flex items-center justify-center text-[10px] text-white font-bold">
                  +12
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
