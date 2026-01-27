"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Shapes,
  CheckCircle2,
  Search,
  Grid
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";

/* =========================
   TYPES
========================= */
type Kategori = {
  id: number;
  nama_kategori: string;
};

function KategoriContent() {
  const { showToast, showConfirm } = useNotification();
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [nama, setNama] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* =========================
     LOAD DATA
  ========================= */
  const load = async (): Promise<void> => {
    try {
      const res = await fetch("/api/kategori");
      const json = await res.json();
      if (json.success) {
        setKategori(json.data);
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat daftar kategori.", "error");
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
    showToast(`${editingId ? 'Memperbarui' : 'Menyimpan'} kategori...`, "loading");
    try {
      const url = editingId ? `/api/kategori/${editingId}` : "/api/kategori";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_kategori: nama }),
      });

      if (res.ok) {
        showToast(`Kategori berhasil ${editingId ? 'diperbarui' : 'dibuat'}!`, "success");
        resetForm();
        await load();
      } else {
        showToast("Gagal menyimpan kategori.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    const confirmed = await showConfirm(
      "Hapus Kategori?",
      "Menghapus kategori akan mempengaruhi alat yang terkait dengan kategori ini."
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/kategori/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Kategori berhasil dihapus.", "success");
        await load();
      } else {
        showToast("Gagal menghapus kategori.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan sistem saat menghapus.", "error");
    }
  };

  const searchParams = useSearchParams();

  useEffect(() => {
    load();
    const search = searchParams.get("search");
    if (search) setSearchTerm(search);
  }, [searchParams]);

  const filteredKategori = kategori.filter(k =>
    k.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.id.toString() === searchTerm
  );

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-blue-900">Categories</h1>
        <p className="text-slate-500 font-medium">
          Organize tools by functionality for easier management.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                {editingId ? <Edit2 className="text-blue-500" size={20} /> : <Plus className="text-blue-500" size={20} />}
                {editingId ? "Edit Category" : "Add Category"}
              </CardTitle>
              <CardDescription>
                Create new classifications for your inventory items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category Name</label>
                  <Input
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="e.g. Power Tools"
                    className="bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {editingId && (
                    <Button type="button" variant="ghost" onClick={resetForm} className="flex-1">
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={adding || !nama.trim()} className="flex-1 shadow-md shadow-blue-500/20">
                    {adding ? <Loader2 className="animate-spin" size={18} /> : (editingId ? "Update" : "Create")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search categories..."
              className="pl-10 bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredKategori.map((k) => (
                <div
                  key={k.id}
                  className={`group p-5 rounded-2xl border flex items-center justify-between transition-all bg-white hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 duration-300
                    ${editingId === k.id ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-100"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Shapes size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{k.nama_kategori}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        ID: {String(k.id).padStart(3, "0")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEdit(k)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(k.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredKategori.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Grid size={24} className="text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-800">No categories found</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Try searching for something else or add a new one.
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

export default function KategoriPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    }>
      <KategoriContent />
    </Suspense>
  );
}
