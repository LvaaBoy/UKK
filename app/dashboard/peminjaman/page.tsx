"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Undo2
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/app/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";

export default function UserPeminjamanPage() {
  const { t, language } = useTranslation();
  const { showToast, showConfirm } = useNotification();
  const [loading, setLoading] = useState(true);

  const translateName = (name: string) => {
    if (!name) return "";
    const key = `tool_name_${name.toLowerCase().replace(/\s+/g, '_')}` as any;
    const translated = t(key);
    return translated === key ? name : translated;
  };
  const [loans, setLoans] = useState<Array<{
    id: number;
    nama_alat: string;
    gambar?: string;
    tgl_pinjam: string;
    tgl_kembali: string;
    status: string;
  }>>([]);

  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      const res = await fetch("/api/user/peminjaman");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("error_loading_data"));
      setLoans(json);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t("unknown_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: number) => {
    const confirmed = await showConfirm(t("return_tool_title"), t("return_tool_desc"));
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/user/peminjaman/${id}/return`, {
        method: "PUT",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("return_failed"));
      showToast(t("return_success"), "success");
      fetchLoans();
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : t("system_error"), "error");
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
          <h2 className="text-3xl font-black mb-4">{t("error_title")}</h2>
          <p className="text-lg opacity-80 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-10 py-4 rounded-2xl font-black hover:bg-red-600 transition-all active:scale-95 shadow-xl shadow-red-500/20"
          >
            {t("try_again")}
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(language, {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    } catch (err) {
      return dateStr;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">
            {t("my_loans")} <span className="text-brand-green">{t("my")}</span>
          </h1>
          <p className="text-(--text-secondary) mt-2 font-medium">{t("track_loans_desc")}</p>
        </div>
        <Link
          href="/dashboard/alat"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg bg-(--card) border border-(--border) text-(--text-primary) hover:bg-(--background)"
        >
          <Undo2 size={18} />
          {t("borrow_again")}
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="rounded-[48px] border shadow-2xl overflow-hidden bg-(--card) border-(--border)">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center shadow-inner">
              <ClipboardList size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-wider text-(--text-primary)">{t("loan_history")}</h2>
              <p className="text-xs text-(--text-secondary) font-bold tracking-widest uppercase">{t("total_transactions", { count: loans.length })}</p>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto -mx-8 md:-mx-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-(--border)">
                  <th className="pb-6 px-8 md:px-12 text-[10px] font-black text-(--text-secondary) uppercase tracking-[0.2em]">{t("item")}</th>
                  <th className="pb-6 px-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-[0.2em]">{t("borrow_date")}</th>
                  <th className="pb-6 px-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-[0.2em]">{t("return_date")}</th>
                  <th className="pb-6 px-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-[0.2em]">{t("status")}</th>
                  <th className="pb-6 px-8 md:px-12 text-[10px] font-black text-(--text-secondary) uppercase tracking-[0.2em]">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : loans.map((loan) => (
                  <tr key={loan.id} className="group hover:bg-(--background) transition-all duration-300">
                    <td className="py-8 px-8 md:px-12">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 bg-(--background) text-(--text-secondary) overflow-hidden border border-(--border)">
                          {loan.gambar ? (
                            <img src={loan.gambar} alt={loan.nama_alat} className="w-full h-full object-cover" />
                          ) : (
                            <Wrench size={18} />
                          )}
                        </div>
                        <span className="font-bold text-lg text-(--text-primary)">{translateName(loan.nama_alat)}</span>
                      </div>
                    </td>
                    <td className="py-8 px-4 font-black text-sm text-(--text-secondary)">{formatDate(loan.tgl_pinjam)}</td>
                    <td className="py-8 px-4 font-black text-sm text-(--text-secondary)">{formatDate(loan.tgl_kembali)}</td>
                    <td className="py-8 px-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest shadow-sm ${loan.status === 'KEMBALI' ? 'bg-emerald-500/10 text-emerald-500' :
                        loan.status === 'DISETUJUI' ? 'bg-blue-500/10 text-blue-500' :
                          loan.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {loan.status === 'PENDING' ? <Clock size={12} /> :
                          loan.status === 'DISETUJUI' ? <CheckCircle2 size={12} /> :
                            loan.status === 'KEMBALI' ? <Undo2 size={12} /> : <AlertCircle size={12} />}
                        {t(`status_${loan.status.toLowerCase()}` as any)}
                      </div>
                    </td>
                    <td className="py-8 px-8 md:px-12">
                      {loan.status === 'DISETUJUI' && (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          className="bg-brand-green hover:bg-opacity-90 text-black px-4 py-2 rounded-xl text-[10px] font-black tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                        >
                          <Undo2 size={12} />
                          {t("return")}
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
              <div className="py-10 text-center font-black animate-pulse text-(--text-secondary)">{t("loading")}</div>
            ) : loans.map((loan) => (
              <div key={loan.id} className="p-6 rounded-3xl border bg-(--background) border-(--border)">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center overflow-hidden border border-(--border)">
                    {loan.gambar ? (
                      <img src={loan.gambar} alt={loan.nama_alat} className="w-full h-full object-cover" />
                    ) : (
                      <Wrench size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-(--text-primary)">{translateName(loan.nama_alat)}</h3>
                    <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">#{loan.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-[9px] font-black text-(--text-secondary) uppercase tracking-widest mb-1">{t("borrow_date")}</p>
                    <p className="text-xs font-bold text-(--text-primary)">{formatDate(loan.tgl_pinjam)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-(--text-secondary) uppercase tracking-widest mb-1">{t("return_date")}</p>
                    <p className="text-xs font-bold text-(--text-primary)">{formatDate(loan.tgl_kembali)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-(--border)">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest ${loan.status === 'KEMBALI' ? 'bg-emerald-500/10 text-emerald-500' :
                    loan.status === 'DISETUJUI' ? 'bg-blue-500/10 text-blue-500' :
                      loan.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {loan.status.toUpperCase()}
                  </div>

                  {loan.status === 'DISETUJUI' && (
                    <button
                      onClick={() => handleReturn(loan.id)}
                      className="bg-brand-green text-black px-4 py-2 rounded-xl text-[9px] font-black tracking-wider transition-all active:scale-95"
                    >
                      {t("return")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!loading && loans.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-(--background) rounded-full flex items-center justify-center mx-auto mb-6 text-(--text-secondary) opacity-30">
                <ClipboardList size={40} />
              </div>
              <h3 className="font-black text-xl text-(--text-secondary) uppercase tracking-tight">{t("no_loans_yet")}</h3>
              <Link href="/dashboard/alat" className="text-brand-green font-bold text-sm mt-4 inline-block hover:underline">
                {t("start_borrowing")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="p-8 rounded-[32px] border text-center bg-(--card) border-(--border)">
        <p className="text-(--text-secondary) text-sm font-medium">
          {t("return_issue_note")} <span className="text-brand-green font-bold">{t("lab_officer")}</span> {t("at_help_desk")}.
        </p>
      </div>
    </div>
  );
}