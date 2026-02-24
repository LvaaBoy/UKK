"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  Filter,
  ArrowUpRight,
  TrendingUp,
  History,
  CheckCircle2,
  Clock,
  Loader2,
  Printer,
  DollarSign,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useTranslation } from "@/app/context/LanguageContext";

type Stats = {
  totalPeminjaman: string;
  alatTersedia: string;
  totalUsers: string;
  revenue: number;
};

type StockAlert = {
  id: number;
  nama_alat: string;
  stok: number;
};

type RecentActivity = {
  id: string;
  user: string;
  item: string;
  date: string;
  status: string;
};

type LaporanData = {
  stats: Stats;
  recentActivities: RecentActivity[];
  stockAlerts: StockAlert[];
};

type ReportCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color?: "blue" | "pink" | "green" | "emerald";
};

export default function LaporanPage() {
  const { t, language } = useTranslation();

  const translateName = (name: string) => {
    if (!name) return "";
    const key = `tool_name_${name.toLowerCase().replace(/\s+/g, '_')}` as any;
    const translated = t(key);
    return translated === key ? name : translated;
  };
  const [data, setData] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const [printDate, setPrintDate] = useState("");

  useEffect(() => {
    setPrintDate(
      new Date().toLocaleDateString(language === "jp" ? "ja-JP" : language === "en" ? "en-US" : language, {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [language]);

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();

        if (json.success) {
          setData({
            stats: json.data.stats,
            recentActivities: json.data.recentActivities || [],
            stockAlerts: json.data.stockAlerts || []
          });
        }
      } catch (err) {
        console.error("Failed to fetch statistics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportPDF = (): void => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center bg-(--card) rounded-[40px] border border-red-100 shadow-2xl shadow-red-500/5 mx-auto max-w-xl mt-20">
        <h2 className="text-3xl font-black text-(--text-primary) mb-2">{t("error")}</h2>
        <p className="text-(--text-secondary) mb-8 font-medium">{t("error_loading_dashboard")}</p>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase text-sm tracking-widest">
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      {/* Print Header */}
      <div className="hidden print:block mb-10 border-b-2 border-slate-200 pb-6 text-center">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">
          {t("report_title")}
        </h1>
        <p className="text-slate-500 font-medium">{t("report_subtitle")}</p>
        <div className="mt-4 text-sm text-slate-400 font-bold">
          {t("printed_on")} {printDate}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-(--text-primary) tracking-tight">{t("system_performance")}</h1>
          <p className="text-(--text-secondary) font-medium">{t("reports_desc")}</p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <Tabs defaultValue="reports">
            <TabsList>
              <TabsTrigger value="overview" onClick={() => router.push("/admin")}>{t("overview")}</TabsTrigger>
              <TabsTrigger value="reports">{t("reports")}</TabsTrigger>
              <TabsTrigger value="audit" onClick={() => router.push("/admin/audit-logs")}>{t("audit_logs")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-3">
            <Button variant="outline" className="hidden md:flex">
              <Filter className="mr-2 h-4 w-4" /> {t("filter")}
            </Button>
            <Button onClick={handleExportPDF} className="shadow-lg shadow-blue-500/20">
              <Printer className="mr-2 h-4 w-4" /> {t("export_print")}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-2">
        <ReportCard title={t("revenue")} value={`Rp ${data.stats.revenue.toLocaleString()}`} icon={<DollarSign size={20} />} trend="+Rp 450k" color="emerald" />
        <ReportCard title={t("total_peminjaman")} value={data.stats.totalPeminjaman} icon={<History size={20} />} trend="+8%" color="blue" />
        <ReportCard title={t("stok_tersedia")} value={data.stats.alatTersedia} icon={<CheckCircle2 size={20} />} trend={t("stable")} color="blue" />
        <ReportCard title={t("registered_users")} value={data.stats.totalUsers} icon={<Users size={20} />} trend="+12" color="pink" />
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-(--border) bg-(--card) shadow-xl shadow-blue-500/5 rounded-[32px]">
        <div className="p-8 border-b border-(--border)">
          <h3 className="font-black text-xl text-(--text-primary) uppercase tracking-tight">{t("borrowing_audit")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-(--background)">
              <tr className="uppercase text-[10px] text-(--text-secondary) font-black tracking-[0.2em]">
                <th className="px-6 py-5">{t("transaction_id")}</th>
                <th className="px-6 py-5">{t("user")}</th>
                <th className="px-6 py-5">{t("item")}</th>
                <th className="px-6 py-5">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border) font-medium">
              {data.recentActivities.length > 0 ? (
                data.recentActivities.map((row) => (
                  <tr key={row.id} className="hover:bg-(--background) transition-colors group">
                    <td className="px-6 py-5 font-mono text-xs text-(--text-secondary)">#{String(row.id).substring(0, 8)}</td>
                    <td className="px-6 py-5 font-bold text-(--text-primary) group-hover:text-blue-600">{row.user}</td>
                    <td className="px-6 py-5 text-(--text-secondary)">{translateName(row.item)}</td>
                    <td className="px-6 py-5">
                      <Badge variant={
                        row.status.toUpperCase() === 'DISETUJUI' || row.status.toUpperCase() === 'KEMBALI' ? 'success' :
                          row.status.toUpperCase() === 'PENDING' ? 'warning' : 'destructive'
                      }>
                        {t(`status_${row.status.toLowerCase()}` as any)}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-(--text-secondary) font-black uppercase text-xs tracking-widest bg-(--background)">
                    {t("no_activity_period")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ReportCard({ title, value, icon, trend, color = "blue" }: ReportCardProps) {
  const colorStyles = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-600",
    green: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
  };

  return (
    <Card className="hover:shadow-2xl hover:shadow-blue-500/5 transition-all p-8 border-(--border) rounded-[32px] group relative overflow-hidden bg-(--card)">
      <div className="flex justify-between mb-6">
        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${colorStyles[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full uppercase italic">
          <ArrowUpRight size={14} />
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-3xl font-black text-(--text-primary) tracking-tighter">{value}</h4>
    </Card>
  );
}
