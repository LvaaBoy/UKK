"use client";

import { useState, useEffect } from "react";
import {
    Shield,
    Search,
    Calendar,
    ArrowUpRight,
    Activity,
    User,
    Info,
    RefreshCw,
    AlertCircle,
    X,
    Database,
    Lock,
    Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
};

interface AuditLog {
    id: number;
    user_id: number;
    action: string;
    target_id: string;
    details: any;
    created_at: string;
    admin_name: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const router = useRouter();

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/audit-logs");
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
            } else {
                setError(data.error || "Failed to fetch logs");
            }
        } catch (err) {
            setError("Connection failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSnapshotRedirect = (log: AuditLog) => {
        if (log.action.includes("ALAT")) {
            router.push(`/admin/alat?search=${log.target_id || ""}`);
        } else if (log.action.includes("KATEGORI")) {
            router.push(`/admin/kategori?search=${log.target_id || ""}`);
        } else if (log.action.includes("USER")) {
            router.push(`/admin/users?search=${log.target_id || ""}`);
        } else {
            setSelectedLog(log);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action: string) => {
        if (action.includes("DELETE")) return "bg-red-500";
        if (action.includes("UPDATE")) return "bg-amber-500";
        if (action.includes("CREATE")) return "bg-green-500";
        return "bg-blue-500";
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 lg:p-10 space-y-10">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5">
                            <Shield size={10} /> Security Audit
                        </div>
                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><Activity size={12} /> System integrity logs</span>
                    </div>
                    <h1 className="text-5xl font-black text-indigo-950 tracking-tighter">Activity Stream</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => fetchLogs()}
                        className="h-14 px-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all active:scale-95 group"
                    >
                        <RefreshCw className={`h-5 w-5 mr-3 text-slate-400 group-hover:text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
                        <span className="font-black text-xs uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">Sync Data</span>
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within:text-indigo-600 text-slate-400 transition-colors">
                        <Search size={20} />
                    </div>
                    <Input
                        placeholder="Search logs by admin, action, or target ID..."
                        className="h-16 pl-14 pr-6 rounded-2xl border-none bg-white shadow-xl shadow-slate-200/50 text-slate-600 font-medium placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-500/20 transition-all text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-indigo-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-xl shadow-indigo-500/30">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Info size={20} />
                        </div>
                        <div>
                            <p className="text-lg font-black leading-none">{filteredLogs.length}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Filtered Events</p>
                        </div>
                    </div>
                    <ArrowUpRight className="opacity-50" />
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-4 p-6 bg-red-50 border-2 border-red-100 rounded-3xl text-red-600 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="shrink-0" />
                    <div>
                        <p className="font-black text-xs uppercase tracking-widest">Database Error</p>
                        <p className="font-bold">{error}</p>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Administrator</th>
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Action Type</th>
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Target</th>
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="group hover:bg-indigo-50/20 transition-all duration-300">
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Calendar size={14} className="text-slate-300" />
                                            <span className="font-bold text-sm tracking-tight">
                                                {formatDate(log.created_at)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                {log.admin_name?.charAt(0) || <User size={14} />}
                                            </div>
                                            <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase text-xs tracking-wide">{log.admin_name || "System"}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-10">
                                        <span className={`px-4 py-1.5 ${getActionColor(log.action)} text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-lg shadow-indigo-500/10`}>
                                            {log.action.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="py-6 px-10">
                                        <span className="font-mono text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">ID: {log.target_id || "N/A"}</span>
                                    </td>
                                    <td className="py-6 px-10">
                                        <button
                                            onClick={() => handleSnapshotRedirect(log)}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
                                        >
                                            View Snapshot <ArrowUpRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield size={16} className="text-indigo-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Activity Metadata</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    {selectedLog.action.replace("_", " ")}
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] rounded-full uppercase">Snapshot</span>
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:rotate-90 transition-all duration-300"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Administrator</p>
                                    <p className="font-bold text-slate-700 flex items-center gap-2"><User size={14} /> {selectedLog.admin_name || "System Process"}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Timestamp</p>
                                    <p className="font-bold text-slate-700 flex items-center gap-2"><Calendar size={14} /> {formatDate(selectedLog.created_at)}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Target ID</p>
                                    <p className="font-bold text-slate-700 flex items-center gap-2"><Database size={14} /> {selectedLog.target_id || "GLOBAL"}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Security Level</p>
                                    <p className="font-bold text-indigo-600 flex items-center gap-2"><Lock size={14} /> Encrypted Payload</p>
                                </div>
                            </div>

                            {/* JSON Data Viewer */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Eye size={14} /> Data Payload Snapshot
                                    </h3>
                                    <span className="text-[10px] font-bold text-indigo-400">application/json</span>
                                </div>
                                <pre className="bg-slate-900 text-indigo-300 p-6 rounded-3xl overflow-x-auto font-mono text-sm leading-relaxed shadow-inner border border-white/5">
                                    <code>{JSON.stringify(selectedLog.details, null, 2)}</code>
                                </pre>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <Button
                                onClick={() => setSelectedLog(null)}
                                className="h-14 px-8 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200"
                            >
                                Close Inspector
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
