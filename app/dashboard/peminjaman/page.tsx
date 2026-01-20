"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  ChevronRight,
  Search,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Undo2
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Link from "next/link";

export default function UserPeminjamanPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      const res = await fetch("/api/user/peminjaman");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data");
      setLoans(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin mengembalikan alat ini?")) return;
    try {
      const res = await fetch(`/api/user/peminjaman/${id}/return`, {
        method: "PUT",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengembalikan alat");
      alert("Alat berhasil dikembalikan!");
      fetchLoans();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  if (error) {
    return (
      <div className="p-20 text-center">
        <div className="bg-red-500/10 text-red-500 p-12 rounded-[48px] border border-red-500/20 max-w-xl mx-auto">
          <AlertCircle size={64} className="mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4">WADUH!</h2>
          <p className="text-lg opacity-80 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-10 py-4 rounded-2xl font-black hover:bg-red-600 transition-all active:scale-95 shadow-xl shadow-red-500/20"
          >
            COBA LAGI SEKALI LAGI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Pinjaman <span className="text-brand-green">Saya</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Lacak status pengajuan dan pengembalian alat Anda.</p>
        </div>
        <Link
          href="/dashboard/alat"
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
        >
          <Undo2 size={18} />
          Pinjam Lagi
        </Link>
      </div>

      {/* Main Content Card */}
      <div className={`rounded-[48px] border shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-brand-card border-white/5 shadow-black/50' : 'bg-white border-slate-100 shadow-slate-200/40'
        }`}>
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center shadow-inner">
              <ClipboardList size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-wider">Daftar Riwayat</h2>
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Total {loans.length} Transaksi</p>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto -mx-8 md:-mx-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                  <th className="pb-6 px-8 md:px-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item</th>
                  <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Peminjaman</th>
                  <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pengembalian</th>
                  <th className="pb-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="pb-6 px-8 md:px-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : loans.map((loan) => (
                  <tr key={loan.id} className="group hover:bg-white/5 transition-all duration-300">
                    <td className="py-8 px-8 md:px-12">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-400'
                          }`}>
                          <Wrench size={18} />
                        </div>
                        <span className="font-bold text-lg">{loan.nama_alat}</span>
                      </div>
                    </td>
                    <td className="py-8 px-4 font-black text-sm text-slate-400">{loan.tgl_pinjam}</td>
                    <td className="py-8 px-4 font-black text-sm text-slate-400">{loan.tgl_kembali}</td>
                    <td className="py-8 px-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest shadow-sm ${loan.status === 'KEMBALI' ? 'bg-emerald-100 text-emerald-600' :
                        loan.status === 'DISETUJUI' ? 'bg-blue-100 text-blue-600' :
                          loan.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {loan.status === 'PENDING' ? <Clock size={12} /> :
                          loan.status === 'DISETUJUI' ? <CheckCircle2 size={12} /> :
                            loan.status === 'KEMBALI' ? <Undo2 size={12} /> : <AlertCircle size={12} />}
                        {loan.status.toUpperCase()}
                      </div>
                    </td>
                    <td className="py-8 px-8 md:px-12">
                      {loan.status === 'DISETUJUI' && (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          className="bg-brand-green hover:bg-opacity-90 text-black px-4 py-2 rounded-xl text-[10px] font-black tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                        >
                          <Undo2 size={12} />
                          KEMBALIKAN
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="py-10 text-center font-black animate-pulse text-slate-400">MEMUAT DATA...</div>
            ) : loans.map((loan) => (
              <div key={loan.id} className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center">
                    <Wrench size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{loan.nama_alat}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{loan.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pinjam</p>
                    <p className="text-xs font-bold">{loan.tgl_pinjam}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kembali</p>
                    <p className="text-xs font-bold">{loan.tgl_kembali}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest ${loan.status === 'KEMBALI' ? 'bg-emerald-100 text-emerald-600' :
                    loan.status === 'DISETUJUI' ? 'bg-blue-100 text-blue-600' :
                      loan.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {loan.status.toUpperCase()}
                  </div>

                  {loan.status === 'DISETUJUI' && (
                    <button
                      onClick={() => handleReturn(loan.id)}
                      className="bg-brand-green text-black px-4 py-2 rounded-xl text-[9px] font-black tracking-wider transition-all active:scale-95"
                    >
                      KEMBALIKAN
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!loading && loans.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <ClipboardList size={40} />
              </div>
              <h3 className="font-black text-xl text-slate-400 uppercase tracking-tight">Belum ada pinjaman</h3>
              <Link href="/dashboard/alat" className="text-brand-green font-bold text-sm mt-4 inline-block hover:underline">
                Mulai pinjam alat sekarang
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className={`p-8 rounded-[32px] border text-center ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
        }`}>
        <p className="text-slate-400 text-sm font-medium">
          Ada kendala saat pengembalian? Hubungi <span className="text-brand-green font-bold">Petugas Lab</span> di meja bantuan.
        </p>
      </div>
    </div>
  );
}