"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  History,
  Loader2,
  Calendar,
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

/* =====================
   TYPES
===================== */
type Stats = {
  totalPeminjaman: string;
  alatTersedia: string;
  totalUsers: string;
};

type WeeklyChart = {
  day: string;
  count: number;
};

type CategoryChart = {
  name: string;
  value: number;
  color: string;
};

type StockAlert = {
  id: string;
  product: string;
  quantity: number;
  alert: number;
};

type RecentActivity = {
  id: string;
  user: string;
  item: string;
  date: string;
  status: "KEMBALI" | "DISETUJUI" | "DIPINJAM" | "PENDING" | "TERLAMBAT";
};

type DashboardData = {
  stats: Stats;
  charts: {
    weekly: WeeklyChart[];
    categories: CategoryChart[];
  };
  stockAlerts: StockAlert[];
  recentActivities: RecentActivity[];
  error?: string;
};

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: "blue" | "pink";
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const res = await fetch("/api/admin/stats");
        const json: DashboardData = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch statistics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">
            {t("preparing_workspace")}
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-8 text-center glass rounded-3xl mx-auto max-w-lg mt-10">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-blue-900 mb-2">
          {t("error_loading_dashboard")}
        </h2>
        <p className="text-slate-500 mb-6">
          {data?.error || "Unknown Error"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
        >
          {t("try_again")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-blue-900">
          {t("stats")}
        </h1>
        <p className="text-slate-500 font-medium">
          {t("monitoring_desc")}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t("total_loans")}
          value={data.stats.totalPeminjaman}
          change="+12.5%"
          isPositive
          icon={<History size={20} />}
          color="blue"
        />
        <StatCard
          title={t("stock")}
          value={data.stats.alatTersedia}
          change="+2.4%"
          isPositive
          icon={<Wrench size={20} />}
          color="pink"
        />
        <StatCard
          title={t("users")}
          value={data.stats.totalUsers}
          change="-1.2%"
          isPositive={false}
          icon={<Users size={20} />}
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly */}
        <div className="lg:col-span-2 p-8 rounded-[40px] bg-white border border-blue-100">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={
                data.charts.weekly.length
                  ? data.charts.weekly
                  : [{ day: "N/A", count: 0 }]
              }
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[12, 12, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Categories */}
        <div className="p-8 rounded-[40px] bg-white border border-blue-100">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.charts.categories}
                innerRadius={70}
                outerRadius={95}
                dataKey="value"
              >
                {data.charts.categories.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={index % 2 === 0 ? "#3b82f6" : "#ec4899"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        {/* Stock Alerts */}
        <div className="bg-white p-8 rounded-[40px] border border-blue-100">
          {data.stockAlerts.length === 0 ? (
            <p className="text-center text-slate-400 font-bold">
              {t("all_stocked")}
            </p>
          ) : (
            data.stockAlerts.map((row) => (
              <div key={row.id} className="flex justify-between py-3">
                <span>{row.product}</span>
                <span className="text-red-500 font-bold">
                  {row.quantity}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-[40px] border border-blue-100">
          {data.recentActivities.length === 0 ? (
            <p className="text-center text-slate-400 font-bold">
              {t("no_recent_logs")}
            </p>
          ) : (
            data.recentActivities.map((row) => (
              <div
                key={row.id}
                className="flex justify-between py-3 border-b"
              >
                <div>
                  <p className="font-bold">{row.user}</p>
                  <p className="text-xs text-slate-400">{row.item}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold">{row.status}</span>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={10} /> {row.date}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================
   COMPONENT
===================== */
function StatCard({
  title,
  value,
  change,
  isPositive,
  icon,
  color,
}: StatCardProps) {
  const isBlue = color === "blue";

  return (
    <div
      className={`p-8 rounded-[40px] bg-white border shadow-sm ${
        isBlue ? "border-blue-100" : "border-pink-100"
      }`}
    >
      <div className="flex justify-between mb-4">
        <div
          className={`p-3 rounded-2xl ${
            isBlue ? "bg-blue-50 text-blue-500" : "bg-pink-50 text-pink-500"
          }`}
        >
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-bold ${
            isPositive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {change}
        </div>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase">
        {title}
      </p>
      <h4 className="text-4xl font-black text-blue-900">{value}</h4>
    </div>
  );
}
