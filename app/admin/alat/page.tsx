"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Wrench,
  Hammer,
  AlertCircle,
  CheckCircle2,
  Package,
  Loader2,
  Settings,
  Edit2, // Added
  Trash2 // Added
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function AlatPage() {
  const [alat, setAlat] = useState<Array<{
    id: number;
    nama_alat: string;
    kategori_id: number;
    nama_kategori: string;
    stok: number;
    deskripsi: string;
  }>>([]);
  const [categories, setCategories] = useState<Array<{
    id: number;
    nama_kategori: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null as number | null,
    nama_alat: "",
    kategori_id: "",
    stok: 0
  });

  const fetchData = async () => {
    try {
      const [resAlat, resCat] = await Promise.all([
        fetch("/api/alat"),
        fetch("/api/kategori")
      ]);
      setAlat(await resAlat.json());
      setCategories(await resCat.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item: {
    id: number;
    nama_alat: string;
    kategori_id: number;
    nama_kategori: string;
    stok: number;
    deskripsi: string;
  } | null = null) => {
    if (item) {
      setFormData({
        id: item.id,
        nama_alat: item.nama_alat,
        kategori_id: item.kategori_id.toString(),
        stok: item.stok
      });
    } else {
      setFormData({ id: null, nama_alat: "", kategori_id: "", stok: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = !!formData.id;
      const url = isEdit ? `/api/alat/${formData.id}` : "/api/alat";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus alat ini dari inventaris?")) return;
    try {
      const res = await fetch(`/api/alat/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
      else alert("Gagal menghapus: Alat mungkin sedang dipinjam.");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAlat = alat.filter(item =>
    item.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { theme } = useTheme();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Manajemen Alat</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola stok dan informasi alat peminjaman.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-brand-green hover:bg-opacity-90 text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus size={20} />
          Tambah Alat Baru
        </button>
      </div>

      {/* Filters & Search */}
      <div className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 items-center transition-colors ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border)' : 'bg-white border-slate-100'}`}>
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama alat atau kategori..."
            className={`w-full pl-12 pr-4 py-2.5 border-none rounded-xl focus:ring-2 focus:ring-brand-green transition-all 
              ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-800'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl font-medium transition-all
            ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlat.map((item) => (
            <div key={item.id} className={`group rounded-[32px] border p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 relative
              ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border)' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all
                  ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  {item.nama_kategori.toLowerCase().includes('bor') ? <Settings size={24} /> :
                    item.nama_kategori.toLowerCase().includes('perkakas') ? <Hammer size={24} /> : <Wrench size={24} />}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleOpenModal(item)} className={`p-2 rounded-lg transition-colors
                    ${theme === 'dark' ? 'text-slate-400 hover:text-brand-green hover:bg-white/5' : 'text-slate-400 hover:text-brand-green hover:bg-emerald-50'}`}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className={`p-2 rounded-lg transition-colors
                    ${theme === 'dark' ? 'text-slate-400 hover:text-red-500 hover:bg-white/5' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className={`font-bold text-lg mb-1 group-hover:text-brand-green transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{item.nama_alat}</h3>
                <p className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block
                  ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-400'}`}>{item.nama_kategori}</p>
              </div>

              <div className={`flex items-center justify-between pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Tersedia</span>
                  <span className={`text-lg font-bold ${item.stok < 5 ? "text-red-500" : (theme === 'dark' ? "text-white" : "text-slate-800")}`}>{item.stok}</span>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider ${item.stok > 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                  }`}>
                  {item.stok > 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {item.stok > 0 ? "READY" : "OUT"}
                </div>
              </div>
            </div>
          ))}

          {filteredAlat.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-[32px] border border-slate-100 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Package size={32} />
              </div>
              <h3 className="font-bold text-slate-800">Tidak ada alat ditemukan</h3>
              <p className="text-slate-400 text-sm mt-1">Coba kata kunci lain atau tambahkan alat baru.</p>
            </div>
          )}
        </div>
      )}

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className={`rounded-[40px] w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-200 border
            ${theme === 'dark' ? 'bg-(--card-bg) border-(--card-border) text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green font-bold shrink-0 uppercase">
                {formData.id ? <Edit2 size={20} /> : <Plus size={20} />}
              </div>
              {formData.id ? "Edit Item" : "Tambah Item"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Alat</label>
                <input
                  required
                  className={`w-full px-5 py-4 border-none rounded-2xl focus:ring-2 focus:ring-brand-green transition-all font-medium 
                    ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-800'}`}
                  placeholder="Masukkan nama alat..."
                  value={formData.nama_alat}
                  onChange={(e) => setFormData({ ...formData, nama_alat: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                  <select
                    required
                    className={`w-full px-5 py-4 border-none rounded-2xl focus:ring-2 focus:ring-brand-green transition-all font-medium appearance-none
                      ${theme === 'dark' ? 'bg-white/5 text-white shadow-none' : 'bg-slate-50 text-slate-800'}`}
                    value={formData.kategori_id}
                    onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                  >
                    <option value="" className={theme === 'dark' ? "bg-[#111b17] text-white" : ""}>Pilih...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className={theme === 'dark' ? "bg-[#111b17] text-white" : ""}>{c.nama_kategori}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    className={`w-full px-5 py-4 border-none rounded-2xl focus:ring-2 focus:ring-brand-green transition-all font-medium
                      ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-800'}`}
                    value={formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-4 font-bold rounded-2xl transition-all 
                  ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-brand-green text-black font-bold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} className="text-black" />}
                  {formData.id ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
