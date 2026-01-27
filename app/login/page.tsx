"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Wrench,
  Key,
  ShieldCheck,
  User,
  Sparkles,
  Loader2
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";

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
    <div className="flex min-h-screen w-full bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Main Container */}
      <div className="z-10 w-full max-w-6xl mx-auto flex items-center justify-center p-4 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-8 w-full">

          {/* Left: Login Form */}
          <div className="flex flex-col justify-center">
            <Card className="border-white/50 shadow-2xl backdrop-blur-xl bg-white/80">
              <CardHeader className="pb-8">
                <div className="flex items-center gap-2 mb-6 text-blue-600">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-slate-800">UKK Inventory</span>
                </div>
                <CardTitle className="text-3xl font-bold text-slate-800">Welcome Back</CardTitle>
                <CardDescription className="text-slate-500 text-base mt-2">
                  Enter your credentials to access the management system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={login} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">Username</label>
                    <div className="relative group">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        required
                        className="pl-10 bg-white"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-sm font-medium text-slate-700">Password</label>
                      <Link href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        required
                        type="password"
                        className="pl-10 bg-white"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full h-12 text-base shadow-blue-500/25 shadow-lg hover:shadow-blue-500/40 transition-all"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : "Sign In to Dashboard"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="justify-center border-t border-slate-100 pt-6">
                <p className="text-slate-500 text-sm">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-blue-600 font-bold hover:underline">
                    Register here
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Right: Feature Showcase (Hidden on mobile) */}
          <div className="hidden lg:flex flex-col justify-center relative">
            <div className="absolute inset-0 bg-blue-600/5 rounded-3xl backdrop-blur-sm transform rotate-3 scale-95 z-0" />
            <div className="glass-card bg-white/40 p-10 border border-white/60 relative z-10 flex flex-col justify-between h-[600px] overflow-hidden group">

              {/* Decor Circles */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-700" />

              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full text-xs font-bold text-blue-700 border border-white/50 backdrop-blur-md">
                  <Sparkles size={14} className="fill-blue-400 text-blue-400" />
                  New Feature
                </div>
                <h3 className="text-4xl font-extrabold text-slate-800 leading-tight">
                  Manage your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
                    Inventory Assets
                  </span>
                  <br /> with ease.
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed max-w-sm">
                  Track borrowings, manage stock, and generate reports in real-time with our new streamlined dashboard.
                </p>
              </div>

              <div className="relative mt-8">
                {/* Mock UI Element */}
                <div className="bg-white/90 rounded-2xl p-4 shadow-xl border border-blue-100 transform rotate-[-2deg] opacity-90 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Item Returned</p>
                      <p className="text-xs text-slate-400">Just now</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-green-500 rounded-full" />
                  </div>
                </div>

                <div className="bg-white/90 rounded-2xl p-4 shadow-xl border border-pink-100 transform translate-y-[-10px] translate-x-[20px] rotate-[3deg] group-hover:translate-x-[10px] group-hover:rotate-[5deg] transition-all duration-500 delay-75">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">New Request</p>
                      <p className="text-xs text-slate-400">2 mins ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-pink-500 rounded-md" />
                    <div className="h-6 w-6 bg-slate-200 rounded-md" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 bg-[url('https://i.pravatar.cc/100?img=${i + 10}')] bg-cover`} />
                  ))}
                </div>
                <span>used by 500+ students</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

