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
    let endpoint = "";

    try {
      let url = "";
      if (action === 'return') {
        url = `/api/petugas/peminjaman/${rawId}/return`;
      } else {
        endpoint = action; // approve or reject
        url = `/api/peminjaman/${rawId}/${endpoint}`;
      }

      const res = await fetch(url, { method: "PUT" });

      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || `Gagal memproses aksi: ${action}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
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
      <div className="p-8 text-center bg-white rounded-3xl mx-auto max-w-lg mt-10 shadow-xl shadow-blue-500/10">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-blue-900 mb-2">Error Loading Dashboard</h2>
        <p className="text-slate-500 mb-6">{data?.error || "Unknown Error"}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 tracking-tight">Petugas Dashboard</h1>
          <p className="text-slate-500 font-medium">Manage daily logistics and verified returns.</p>
        </div>
        <Button variant="outline" className="self-start">
          <PackageCheck className="mr-2 h-4 w-4 text-emerald-500" />
          Quick Scan
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PetugasStat
          title="Incoming Requests"
          value={data.stats.pendingRequests}
          icon={<Clock size={20} />}
          color="blue"
        />
        <PetugasStat
          title="Active Loans"
          value={data.stats.activeLoans}
          icon={<CheckCircle2 size={20} />}
          color="green"
        />
        <PetugasStat
          title="Tools Out"
          value={data.stats.toolsOut}
          icon={<ClipboardList size={20} />}
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List (Incoming & Returns) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-xl text-blue-900 flex items-center gap-2">
            Needs Attention
            <Badge variant="warning">{data.incomingRequests.length}</Badge>
          </h3>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-blue-500/5 p-2">
            {data.incomingRequests.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-400 opacity-50"><CheckCircle2 size={32} /></div>
                <p className="text-slate-400 font-bold">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {data.incomingRequests.map((row) => (
                  <div key={row.id} className="group p-5 hover:bg-slate-50 rounded-[24px] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border transition-colors
                                      ${row.status === 'PENDING_KEMBALI'
                          ? 'bg-orange-50 text-orange-500 border-orange-100 group-hover:border-orange-200'
                          : 'bg-blue-50 text-blue-500 border-blue-100 group-hover:border-blue-200'}`}>
                        {row.status === 'PENDING_KEMBALI' ? <ArrowRightLeft size={20} /> : <History size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-blue-900">{row.user}</p>
                          <Badge variant={row.status === 'PENDING_KEMBALI' ? 'warning' : 'secondary'} className="text-[10px] px-2 h-5">
                            {row.status === 'PENDING_KEMBALI' ? 'RETURNING' : 'BORROWING'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Item: <span className="text-slate-700 font-bold">{row.item}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {row.status === 'PENDING_KEMBALI' ? (
                        <Button onClick={() => updateStatus(row.id, 'return')} size="sm" className="bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-emerald-500/20">
                          <CheckCircle2 size={16} className="mr-2" /> Confirm Return
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

        {/* Activity Tracking & History */}
        <div className="space-y-6">
          <h3 className="font-bold text-xl text-blue-900">Activity & Flow</h3>
          <Card className="border-slate-100 bg-white shadow-xl shadow-blue-500/5">
            <div className="h-44 w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.activity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-6 pt-0 space-y-4">
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Recent Approved</h4>
              {data.activeTracking.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700">{item.user}</span>
                  <span className="text-slate-400 text-xs">{item.date}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Return History Section */}
          <h3 className="font-bold text-xl text-blue-900 pt-2">Return History</h3>
          <Card className="border-slate-100 bg-white shadow-xl shadow-blue-500/5">
            <div className="p-6 space-y-4">
              {(data as any).returnedHistory?.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">No returns yet.</p>
              ) : (
                (data as any).returnedHistory?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-slate-700">{item.user}</p>
                      <p className="text-[10px] text-slate-400">{item.item}</p>
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
    blue: "bg-blue-50 text-blue-500",
    green: "bg-emerald-50 text-emerald-500",
    pink: "bg-pink-50 text-pink-500",
  };

  return (
    <Card className="border-slate-100 hover:shadow-lg transition-all">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${colorStyles[color as keyof typeof colorStyles]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{title}</p>
          <h4 className="text-3xl font-black text-slate-800">{value}</h4>
        </div>
      </CardContent>
    </Card>
  );
}
