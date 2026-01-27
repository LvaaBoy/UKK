"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    CheckCircle2,
    AlertCircle,
    Info,
    X,
    AlertTriangle,
    Loader2
} from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ConfirmState {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

interface NotificationContextType {
    showToast: (message: string, type?: ToastType) => void;
    showConfirm: (title: string, message: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirm, setConfirm] = useState<ConfirmState>({
        show: false,
        title: "",
        message: "",
        onConfirm: () => { },
        onCancel: () => { }
    });

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        if (type !== "loading") {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 5000);
        }
    }, []);

    const showConfirm = useCallback((title: string, message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirm({
                show: true,
                title,
                message,
                onConfirm: () => {
                    setConfirm(prev => ({ ...prev, show: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setConfirm(prev => ({ ...prev, show: false }));
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <NotificationContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className="pointer-events-auto"
                        >
                            <ToastItem toast={toast} onClose={() => {
                                setToasts(prev => prev.filter(t => t.id !== toast.id));
                            }} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirm.show && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-8 space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 text-center tracking-tight">{confirm.title}</h3>
                                <p className="text-slate-500 text-center font-medium leading-relaxed">{confirm.message}</p>
                            </div>
                            <div className="p-8 pt-0 flex gap-3">
                                <button
                                    onClick={confirm.onCancel}
                                    className="flex-1 h-14 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirm.onConfirm}
                                    className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-200 transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast, onClose: () => void }) {
    const icons = {
        success: <CheckCircle2 className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        warning: <AlertTriangle className="text-amber-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
        loading: <Loader2 className="text-blue-500 animate-spin" size={20} />
    };

    const bgColors = {
        success: "bg-green-50 border-green-100",
        error: "bg-red-50 border-red-100",
        warning: "bg-amber-50 border-amber-100",
        info: "bg-blue-50 border-blue-100",
        loading: "bg-slate-50 border-slate-100"
    };

    return (
        <div className={`min-w-[320px] p-4 pr-12 rounded-2xl border bg-white shadow-xl shadow-slate-200/50 flex items-center gap-4 relative overflow-hidden group`}>
            {/* Progress bar for auto-dismiss */}
            {toast.type !== "loading" && (
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className={`absolute bottom-0 left-0 h-1 ${toast.type === 'success' ? 'bg-green-500' :
                            toast.type === 'error' ? 'bg-red-500' :
                                toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                />
            )}

            <div className={`w-10 h-10 shrink-0 rounded-xl ${bgColors[toast.type]} flex items-center justify-center`}>
                {icons[toast.type]}
            </div>

            <div className="flex-1">
                <p className="text-sm font-bold text-slate-700 leading-tight">{toast.message}</p>
            </div>

            <button
                onClick={onClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}
