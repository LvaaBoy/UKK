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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

/* =====================
   TYPES
===================== */
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
  const [data, setData] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const [printDate] = useState(
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

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
      <div className="p-12 text-center bg-white rounded-[40px] border border-red-100 shadow-2xl shadow-red-500/5 mx-auto max-w-xl mt-20">
        <h2 className="text-3xl font-black text-blue-900 mb-2">Failure</h2>
        <p className="text-slate-500 mb-8 font-medium">Unable to load report data.</p>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase text-sm tracking-widest">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      {/* Print Header */}
      <div className="hidden print:block mb-10 border-b-2 border-slate-200 pb-6 text-center">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">
          Laporan Peminjaman Alat
        </h1>
        <p className="text-slate-500 font-medium">
          Sistem Informasi Inventaris & Peminjaman Lab
        </p>
        <div className="mt-4 text-sm text-slate-400 font-bold">
          Dicetak pada: {printDate}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-blue-900 tracking-tight">System Performance</h1>
          <p className="text-slate-500 font-medium">
            Comprehensive audit of borrowing history and inventory status.
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <Tabs defaultValue="reports">
            <TabsList>
              <TabsTrigger value="overview" onClick={() => router.push("/admin")}>Overview</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="audit" onClick={() => router.push("/admin/audit-logs")}>Audit Logs</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-3">
            <Button variant="outline" className="hidden md:flex">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button onClick={handleExportPDF} className="shadow-lg shadow-blue-500/20">
              <Printer className="mr-2 h-4 w-4" /> Export/Print
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-2">
        <ReportCard
          title="System Revenue"
          value={`Rp ${data.stats.revenue.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          trend="+Rp 450k"
          color="emerald"
        />
        <ReportCard
          title="Total Peminjaman"
          value={data.stats.totalPeminjaman}
          icon={<History size={20} />}
          trend="+8%"
          color="blue"
        />
        <ReportCard
          title="Stok Tersedia"
          value={data.stats.alatTersedia}
          icon={<CheckCircle2 size={20} />}
          trend="Stable"
          color="blue"
        />
        <ReportCard
          title="Registered Users"
          value={data.stats.totalUsers}
          icon={<Users size={20} />}
          trend="+12"
          color="pink"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-slate-100 bg-white shadow-xl shadow-slate-200/50 rounded-[32px]">
        <div className="p-8 border-b border-slate-50">
          <h3 className="font-black text-xl text-blue-900 uppercase tracking-tight">Borrowing Audit Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50">
              <tr className="uppercase text-[10px] text-slate-400 font-black tracking-[0.2em]">
                <th className="px-6 py-5">Transaction ID</th>
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Item</th>
                <th className="px-6 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {data.recentActivities.length > 0 ? (
                data.recentActivities.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-5 font-mono text-xs text-slate-400">#{String(row.id).substring(0, 8)}</td>
                    <td className="px-6 py-5 font-bold text-slate-800 group-hover:text-blue-600">{row.user}</td>
                    <td className="px-6 py-5 text-slate-600">{row.item}</td>
                    <td className="px-6 py-5">
                      <Badge variant={
                        row.status.toUpperCase() === 'DISETUJUI' || row.status.toUpperCase() === 'KEMBALI' ? 'success' :
                          row.status.toUpperCase() === 'PENDING' ? 'warning' : 'destructive'
                      }>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 font-black uppercase text-xs tracking-widest bg-slate-50/20">
                    No borrowing activity found in current period.
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

function ReportCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
}: ReportCardProps) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    pink: "bg-pink-50 text-pink-600",
    green: "bg-emerald-50 text-emerald-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <Card className="hover:shadow-2xl hover:shadow-blue-500/5 transition-all p-8 border-slate-100 rounded-[32px] group relative overflow-hidden bg-white">
      <div className="flex justify-between mb-6">
        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${colorStyles[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full uppercase italic">
          <ArrowUpRight size={14} />
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-3xl font-black text-blue-900 tracking-tighter">{value}</h4>
    </Card>
  );
}
