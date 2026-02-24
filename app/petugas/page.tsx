"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Check,
  X,
  PackageCheck,
  Loader2,
  History,
  ArrowRightLeft
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import {
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function PetugasDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: { pendingRequests: string; activeLoans: string; toolsOut: string };
    incomingRequests: Array<{ id: string; user: string; item: string; status: string; date: string }>;
    charts: { activity: Array<{ day: string; count: number }> };
    activeTracking: Array<{ id: string; user: string; item: string; status: string; date: string }>;
    error?: string;
  } | null>(null);

  const fetchData = () => {
    fetch("/api/petugas/stats")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: string, action: 'approve' | 'reject' | 'return') => {
    const rawId = id.replace("#", "");
    try {
      let url = "";
      if (action === 'return') {
        url = `/api/petugas/peminjaman/${rawId}/return`;
      } else {
        url = `/api/peminjaman/${rawId}/${action}`;
      }
      const res = await fetch(url, { method: "PUT" });
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || t("system_error"));
      }
    } catch (err) {
      console.error(err);
      alert(t("system_error"));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-8 text-center bg-(--card) rounded-3xl mx-auto max-w-lg mt-10 shadow-xl shadow-blue-500/10 border border-(--border)">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-(--text-primary) mb-2">{t("error_loading_dashboard")}</h2>
        <p className="text-(--text-secondary) mb-6">{data?.error || t("error")}</p>
        <Button onClick={() => window.location.reload()}>{t("try_again")}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">{t("dashboard")}</h1>
          <p className="text-(--text-secondary) font-medium">{t("petugas_desc")}</p>
        </div>
        <Button variant="outline" className="self-start">
          <PackageCheck className="mr-2 h-4 w-4 text-emerald-500" />
          {t("quick_scan")}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PetugasStat title={t("pending_requests")} value={data.stats.pendingRequests} icon={<Clock size={20} />} color="blue" />
        <PetugasStat title={t("active_loans")} value={data.stats.activeLoans} icon={<CheckCircle2 size={20} />} color="green" />
        <PetugasStat title={t("tools_out")} value={data.stats.toolsOut} icon={<ClipboardList size={20} />} color="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-xl text-(--text-primary) flex items-center gap-2">
            {t("needs_attention")}
            <Badge variant="warning">{data.incomingRequests.length}</Badge>
          </h3>

          <div className="bg-(--card) rounded-[32px] border border-(--border) shadow-xl shadow-blue-500/5 p-2">
            {data.incomingRequests.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto text-blue-400 opacity-50"><CheckCircle2 size={32} /></div>
                <p className="text-(--text-secondary) font-bold">{t("all_caught_up")}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {data.incomingRequests.map((row) => (
                  <div key={row.id} className="group p-5 hover:bg-(--background) rounded-[24px] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border transition-colors
                                      ${row.status === 'PENDING_KEMBALI'
                          ? 'bg-orange-50 text-orange-500 border-orange-100 group-hover:border-orange-200'
                          : 'bg-blue-50 text-blue-500 border-blue-100 group-hover:border-blue-200'}`}>
                        {row.status === 'PENDING_KEMBALI' ? <ArrowRightLeft size={20} /> : <History size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-(--text-primary)">{row.user}</p>
                          <Badge variant={row.status === 'PENDING_KEMBALI' ? 'warning' : 'secondary'} className="text-[10px] px-2 h-5">
                            {row.status === 'PENDING_KEMBALI' ? t("returning") : t("borrowing")}
                          </Badge>
                        </div>
                        <p className="text-xs text-(--text-secondary) font-medium">{t("item")}: <span className="text-(--text-primary) font-bold">{row.item}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {row.status === 'PENDING_KEMBALI' ? (
                        <Button onClick={() => updateStatus(row.id, 'return')} size="sm" className="bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-emerald-500/20">
                          <CheckCircle2 size={16} className="mr-2" /> {t("confirm_return")}
                        </Button>
                      ) : (
                        <>
                          <Button onClick={() => updateStatus(row.id, 'approve')} size="icon" className="h-10 w-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
                            <Check size={18} />
                          </Button>
                          <Button onClick={() => updateStatus(row.id, 'reject')} size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                            <X size={18} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity & History */}
        <div className="space-y-6">
          <h3 className="font-bold text-xl text-(--text-primary)">{t("activity_flow")}</h3>
          <Card className="border-(--border) bg-(--card) shadow-xl shadow-blue-500/5">
            <div className="h-44 w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.activity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4}
                    dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-6 pt-0 space-y-4">
              <h4 className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">{t("recent_approved")}</h4>
              {data.activeTracking.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-(--text-primary)">{item.user}</span>
                  <span className="text-(--text-secondary) text-xs">{item.date}</span>
                </div>
              ))}
            </div>
          </Card>

          <h3 className="font-bold text-xl text-(--text-primary) pt-2">{t("return_history")}</h3>
          <Card className="border-(--border) bg-(--card) shadow-xl shadow-blue-500/5">
            <div className="p-6 space-y-4">
              {(data as any).returnedHistory?.length === 0 ? (
                <p className="text-center text-(--text-secondary) text-sm py-4">{t("no_returns_yet")}</p>
              ) : (
                (data as any).returnedHistory?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm border-b border-(--border) pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-(--text-primary)">{item.user}</p>
                      <p className="text-[10px] text-(--text-secondary)">{item.item}</p>
                    </div>
                    <span className="text-emerald-500 font-bold text-xs">{item.date}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PetugasStat({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorStyles = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-500",
    green: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500",
    pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-500",
  };

  return (
    <Card className="border-(--border) bg-(--card) hover:shadow-lg transition-all">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${colorStyles[color as keyof typeof colorStyles]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest mb-1">{title}</p>
          <h4 className="text-3xl font-black text-(--text-primary)">{value}</h4>
        </div>
      </CardContent>
    </Card>
  );
}
