"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Shapes,
  CheckCircle2
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function KategoriPage() {
  const [kategori, setKategori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nama, setNama] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/kategori");
      setKategori(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (k: any) => {
    setEditingId(k.id);
    setNama(k.nama_kategori);
  };

  const resetForm = () => {
    setEditingId(null);
    setNama("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    try {
      await fetch(`/api/kategori/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const { theme } = useTheme();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Kategori Alat</h1>
        <p className="text-slate-500 text-sm mt-1">Kelompokkan alat berdasarkan fungsinya untuk memudahkan pencarian.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-[32px] border shadow-sm sticky top-8 transition-colors ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border) text-white' : 'bg-white border-slate-100'}`}>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center text-brand-green">
                {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
              </div>
              {editingId ? "Edit Kategori" : "Tambah Kategori"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">Nama Kategori</label>
                <input
                  required
                  className={`w-full border-none rounded-2xl px-4 py-3 transition-all font-medium 
                    ${theme === 'dark' ? 'bg-white/5 text-white placeholder:text-slate-600' : 'bg-slate-50 text-slate-800 placeholder:text-slate-300'}`}
                  placeholder="Contoh: Perkakas Listrik"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  disabled={adding || !nama.trim()}
                  type="submit"
                  className="flex-1 bg-brand-green text-black font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-opacity-90"
                >
                  {adding ? <Loader2 className="animate-spin" size={20} /> : (editingId ? <CheckCircle2 size={20} className="text-black" /> : <Plus size={20} />)}
                  {editingId ? "Update" : "Simpan"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-4 py-3.5 font-bold rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kategori.map((k) => (
                <div key={k.id} className={`group p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 
                  ${editingId === k.id ? "border-brand-green ring-2 ring-brand-green/20" : (theme === 'dark' ? "bg-(--card-bg) border-(--card-border) hover:border-emerald-500/30" : "bg-white border-slate-100 hover:border-emerald-200")}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${editingId === k.id ? "bg-brand-green text-black" : (theme === 'dark' ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-400")} group-hover:bg-brand-green group-hover:text-black`}>
                      <Shapes size={20} />
                    </div>
                    <div>
                      <h4 className={`font-bold transition-colors group-hover:text-emerald-500 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{k.nama_kategori}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {String(k.id).padStart(3, '0')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(k)}
                      className={`p-2 rounded-lg transition-all ${editingId === k.id ? "text-brand-green bg-emerald-50" : "text-slate-300 hover:text-brand-green hover:bg-emerald-50 opacity-0 group-hover:opacity-100"}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(k.id)}
                      className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${theme === 'dark' ? 'text-slate-600 hover:text-red-500 hover:bg-white/5' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {kategori.length === 0 && (
                <div className="col-span-full py-12 bg-white rounded-[32px] border border-slate-100 text-center">
                  <Shapes className="mx-auto text-slate-200 mb-3" size={40} />
                  <p className="text-slate-400 font-medium font-italic">Belum ada kategori ditambahkan.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
