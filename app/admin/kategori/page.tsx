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
import { useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { useTranslation } from "@/app/context/LanguageContext";

type Kategori = {
  id: number;
  nama_kategori: string;
};

function KategoriContent() {
  const { showToast, showConfirm } = useNotification();
  const { t } = useTranslation();
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [nama, setNama] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const translateCategory = (name: string) => {
    if (!name) return "";
    const key = `category_${name.toLowerCase().replace(/\s+/g, "_")}` as any;
    const translated = t(key);
    return translated === key ? name : translated;
  };

  const load = async (): Promise<void> => {
    try {
      const res = await fetch("/api/kategori");
      const json = await res.json();
      if (json.success) {
        setKategori(json.data);
      }
    } catch (err) {
      console.error(err);
      showToast(t("connection_failed"), "error");
    } finally {
      setLoading(false);
    }
  };

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
    showToast(editingId ? t("synchronizing") : t("synchronizing"), "loading");
    try {
      const url = editingId ? `/api/kategori/${editingId}` : "/api/kategori";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_kategori: nama }),
      });

      if (res.ok) {
        showToast(editingId ? t("category_updated") : t("category_added"), "success");
        resetForm();
        await load();
      } else {
        showToast(t("tool_save_failed"), "error");
      }
    } catch (err) {
      console.error(err);
      showToast(t("system_error"), "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    const confirmed = await showConfirm(t("delete_category_title"), t("delete_category_desc"));
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/kategori/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(t("category_deleted"), "success");
        await load();
      } else {
        showToast(t("tool_save_failed"), "error");
      }
    } catch (err) {
      console.error(err);
      showToast(t("system_error"), "error");
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-(--text-primary)">{t("categories")}</h1>
        <p className="text-(--text-secondary) font-medium">{t("categories_desc")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 border-(--border) bg-(--card)">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-(--text-primary)">
                {editingId ? <Edit2 className="text-blue-500" size={20} /> : <Plus className="text-blue-500" size={20} />}
                {editingId ? t("edit_category") : t("add_category")}
              </CardTitle>
              <CardDescription className="text-(--text-secondary)">
                {t("create_classifications")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--text-secondary)">{t("category_name")}</label>
                  <Input
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder={t("category_name_placeholder")}
                    className="bg-(--background)"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {editingId && (
                    <Button type="button" variant="ghost" onClick={resetForm} className="flex-1">
                      {t("cancel")}
                    </Button>
                  )}
                  <Button type="submit" disabled={adding || !nama.trim()} className="flex-1 shadow-md shadow-blue-500/20">
                    {adding ? <Loader2 className="animate-spin" size={18} /> : (editingId ? t("update") : t("create"))}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)" size={18} />
            <Input
              placeholder={t("search_categories")}
              className="pl-10 bg-(--card) border-(--border)"
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
                  className={`group p-5 rounded-2xl border flex items-center justify-between transition-all bg-(--card) hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 duration-300
                    ${editingId === k.id ? "border-blue-500 ring-2 ring-blue-500/10" : "border-(--border)"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Shapes size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-(--text-primary)">{translateCategory(k.nama_kategori)}</h4>
                      <p className="text-[10px] text-(--text-secondary) font-bold uppercase tracking-wider">
                        ID: {String(k.id).padStart(3, "0")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-(--text-secondary) hover:text-blue-600" onClick={() => handleEdit(k)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-(--text-secondary) hover:text-red-500" onClick={() => handleDelete(k.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredKategori.length === 0 && (
                <div className="col-span-full py-12 text-center bg-(--card) rounded-3xl border border-(--border) border-dashed">
                  <div className="w-16 h-16 bg-(--background) rounded-full flex items-center justify-center mx-auto mb-3">
                    <Grid size={24} className="text-(--text-secondary)" />
                  </div>
                  <h3 className="font-bold text-(--text-primary)">{t("no_categories")}</h3>
                  <p className="text-(--text-secondary) text-sm mt-1">{t("no_categories_desc")}</p>
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
