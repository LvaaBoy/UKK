"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Shapes,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/* =========================
   TYPES
========================= */
type Kategori = {
  id: number;
  nama_kategori: string;
};

export default function KategoriPage() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [nama, setNama] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  /* =========================
     LOAD DATA
  ========================= */
  const load = async (): Promise<void> => {
    try {
      const res = await fetch("/api/kategori");
      const data: Kategori[] = await res.json();
      setKategori(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HANDLERS
  ========================= */
  const handleEdit = (k: Kategori): void => {
    setEditingId(k.id);
    setNama(k.nama_kategori);
  };

  const resetForm = (): void => {
    setEditingId(null);
    setNama("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!nama.trim()) return;

    setAdding(true);
    try {
      const url = editingId ? `/api/kategori/${editingId}` : "/api/kategori";
      const method = editingId ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_kategori: nama }),
      });

      resetForm();
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

    try {
      await fetch(`/api/kategori/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const { theme } = useTheme();

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1
          className={`text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-slate-800"
          }`}
        >
          Kategori Alat
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelompokkan alat berdasarkan fungsinya untuk memudahkan pencarian.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div
            className={`p-6 rounded-[32px] border shadow-sm sticky top-8 transition-colors ${
              theme === "dark"
                ? "bg-(--card-bg) border-(--card-border) text-white"
                : "bg-white border-slate-100"
            }`}
          >
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center text-brand-green">
                {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
              </div>
              {editingId ? "Edit Kategori" : "Tambah Kategori"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">
                  Nama Kategori
                </label>
                <input
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Perkakas Listrik"
                  className={`w-full border-none rounded-2xl px-4 py-3 font-medium transition-all
                    ${
                      theme === "dark"
                        ? "bg-white/5 text-white placeholder:text-slate-600"
                        : "bg-slate-50 text-slate-800 placeholder:text-slate-300"
                    }`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={adding || !nama.trim()}
                  className="flex-1 bg-brand-green text-black font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {adding ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : editingId ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                  {editingId ? "Update" : "Simpan"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-4 py-3.5 font-bold rounded-2xl transition-all ${
                      theme === "dark"
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kategori.map((k) => (
                <div
                  key={k.id}
                  className={`group p-5 rounded-2xl border flex items-center justify-between transition-all
                    ${
                      editingId === k.id
                        ? "border-brand-green ring-2 ring-brand-green/20"
                        : theme === "dark"
                        ? "bg-(--card-bg) border-(--card-border)"
                        : "bg-white border-slate-100"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-green/10 text-brand-green">
                      <Shapes size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold">{k.nama_kategori}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">
                        ID: {String(k.id).padStart(3, "0")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(k)}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(k.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {kategori.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <Shapes size={40} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-400">
                    Belum ada kategori ditambahkan.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
