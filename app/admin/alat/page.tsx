"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Plus,
  Trash2,
  Edit2,
  History,
  Box,
  RefreshCw,
  LayoutGrid,
  Filter,
  ArrowUpDown,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useNotification } from "@/context/NotificationContext";
import { EquipmentDetailModal } from "@/components/inventory/EquipmentDetailModal";
import { useTranslation } from "@/app/context/LanguageContext";

function AlatContent() {
  const { showToast, showConfirm } = useNotification();
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  const [alat, setAlat] = useState<Array<{
    id: number;
    nama_alat: string;
    kategori_id: number;
    nama_kategori: string;
    stok: number;
    gambar: string;
    deskripsi: string;
  }>>([]);
  const [categories, setCategories] = useState<Array<{
    id: number;
    nama_kategori: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedToolForDetail, setSelectedToolForDetail] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const translateCategory = (name: string) => {
    if (!name) return "";
    const key = `category_${name.toLowerCase().replace(/\s+/g, "_")}` as any;
    const translated = t(key);
    return translated === key ? name : translated;
  };

  const translateName = (name: string) => {
    if (!name) return "";
    const key = `tool_name_${name.toLowerCase().replace(/\s+/g, '_')}` as any;
    const translated = t(key);
    return translated === key ? name : translated;
  };

  const translateDesc = (desc: string, name: string) => {
    if (!name) return desc;
    const key = `tool_desc_${name.toLowerCase().replace(/\s+/g, '_')}` as any;
    const translated = t(key);
    return translated === key ? desc : translated;
  };

  const [formData, setFormData] = useState({
    id: null as number | null,
    nama_alat: "",
    kategori_id: "",
    stok: 0,
    gambar: "",
    deskripsi: ""
  });

  const fetchData = async () => {
    try {
      const [resAlat, resCat] = await Promise.all([
        fetch("/api/alat"),
        fetch("/api/kategori")
      ]);
      if (resAlat.ok) {
        const json = await resAlat.json();
        setAlat(json.success ? json.data : []);
      }
      if (resCat.ok) {
        const json = await resCat.json();
        setCategories(json.success ? json.data : []);
      }
    } catch (err) {
      console.error("[ALAT_FETCH_ERROR]", err);
      showToast(t("error_loading_data"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const search = searchParams.get("search");
    if (search) setSearchTerm(search);
  }, [searchParams]);

  const handleOpenDetail = (item: any) => {
    setSelectedToolForDetail(item);
    setShowDetailModal(true);
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setFormData({
        id: item.id,
        nama_alat: item.nama_alat,
        kategori_id: item.kategori_id?.toString() || "",
        stok: item.stok,
        gambar: item.gambar || "",
        deskripsi: item.deskripsi || ""
      });
    } else {
      setFormData({ id: null, nama_alat: "", kategori_id: "", stok: 0, gambar: "", deskripsi: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    showToast(t("saving"), "loading");
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
        showToast(isEdit ? t("item_updated") : t("item_added"), "success");
        fetchData();
      } else {
        showToast(t("error_saving"), "error");
      }
    } catch (err) {
      console.error(err);
      showToast(t("system_error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm(t("delete_tool_title"), t("delete_tool_desc"));
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/alat/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(t("item_deleted"), "success");
        fetchData();
      } else {
        showToast(t("error_delete_borrowed"), "error");
      }
    } catch (err) {
      console.error(err);
      showToast(t("system_error"), "error");
    }
  };

  const filteredAlat = alat.filter(item =>
    item.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama_kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString() === searchTerm
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-indigo-500/20">
              <Box size={10} /> {t("inventory_control")}
            </div>
            <span className="text-xs text-(--text-secondary) font-bold flex items-center gap-1">
              <History size={12} /> {t("live_tracking")}
            </span>
          </div>
          <h1 className="text-5xl font-black text-(--text-primary) tracking-tighter">{t("tools_management")}</h1>
          <p className="text-(--text-secondary) font-medium mt-2 max-w-xl text-lg">{t("tools_management_desc")}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleOpenModal()}
            className="h-16 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/30 font-black uppercase tracking-widest text-xs flex items-center gap-3 group transition-all active:scale-95"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" /> {t("add_tool")}
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Package, label: t("total_assets"), value: alat.length, color: "indigo" },
          { icon: LayoutGrid, label: t("categories"), value: categories.length, color: "blue" },
          { icon: Filter, label: t("in_stock"), value: alat.reduce((acc, curr) => acc + curr.stok, 0), color: "emerald" },
          { icon: ArrowUpDown, label: t("filtered"), value: filteredAlat.length, color: "slate" }
        ].map((stat, i) => (
          <div key={i} className="bg-(--card) p-6 rounded-3xl border border-(--border) shadow-xl flex items-center gap-5 hover:border-indigo-100 transition-colors group">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-(--text-primary) leading-none">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-(--text-secondary) mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-(--text-secondary) group-focus-within:text-indigo-600 transition-colors">
          <Search size={22} />
        </div>
        <Input
          placeholder={t("search_tools_placeholder")}
          className="h-20 pl-16 pr-8 rounded-[28px] border-none bg-(--card) shadow-2xl text-xl font-medium text-(--text-primary) placeholder:text-(--text-secondary) focus-visible:ring-4 focus-visible:ring-indigo-500/10 transition-all antialiased"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Table Content */}
      <Card className="rounded-[40px] border-none bg-(--card) shadow-2xl overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-(--card)/60 backdrop-blur-md z-30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-12 w-12 text-indigo-600 animate-spin" />
              <p className="text-(--text-secondary) font-black uppercase tracking-[0.2em] text-[10px]">{t("loading")}</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--background) border-b border-(--border) italic">
                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">{t("tool_name")}</th>
                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">{t("category")}</th>
                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">{t("stock_status")}</th>
                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-widest text-(--text-secondary) text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {filteredAlat.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className="group hover:bg-(--background) transition-all duration-300 cursor-pointer"
                >
                  <td className="py-8 px-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[24px] bg-(--background) flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner overflow-hidden relative border border-(--border)">
                        {item.gambar ? (
                          <img src={item.gambar} alt={item.nama_alat} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={24} className="opacity-40 group-hover:opacity-100" />
                        )}
                        <span className="absolute bottom-1 right-2 text-[8px] font-black opacity-30">#{item.id}</span>
                      </div>
                      <div className="max-w-[200px]">
                        <p className="font-black text-(--text-primary) text-lg leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">{translateName(item.nama_alat)}</p>
                        <p className="text-(--text-secondary) text-[10px] font-bold mt-1 line-clamp-1 italic px-1 opacity-60">
                          {translateDesc(item.deskripsi, item.nama_alat) || t("no_description")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-8 px-10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="font-black text-(--text-secondary) text-xs uppercase tracking-widest opacity-80">{translateCategory(item.nama_kategori)}</span>
                    </div>
                  </td>
                  <td className="py-8 px-10">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between max-w-[120px]">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.stok > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {item.stok > 0 ? t("in_stock") : t("out_of_stock")}
                        </span>
                        <span className="text-(--text-primary) font-bold text-sm tracking-tighter">{item.stok}</span>
                      </div>
                      <div className="w-[120px] h-1.5 bg-(--background) rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.stok > 10 ? 'bg-indigo-500' : item.stok > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((item.stok / 50) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-8 px-10">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                        className="h-12 w-12 rounded-2xl border border-(--border) hover:bg-(--background) hover:text-indigo-600 hover:shadow-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="h-12 w-12 rounded-2xl border border-(--border) hover:bg-red-50 hover:text-red-600 hover:border-red-100 hover:shadow-lg transition-all text-(--text-secondary)"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAlat.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-[32px] bg-(--background) flex items-center justify-center text-(--text-secondary)">
                        <Search size={40} />
                      </div>
                      <div>
                        <p className="text-(--text-primary) font-black text-2xl tracking-tight">{t("no_results")}</p>
                        <p className="text-(--text-secondary) font-bold uppercase text-[10px] tracking-widest leading-none mt-1">{t("try_different_search")}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-(--card) rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <form onSubmit={handleSubmit}>
              <div className="p-10 border-b border-(--border) overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-3xl font-black text-(--text-primary) tracking-tighter">
                  {formData.id ? t("edit_tool") : t("add_tool")}
                </h3>
                <p className="text-(--text-secondary) font-medium mt-1">{t("configure_inventory")}</p>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary) ml-1">{t("tool_name")}</label>
                  <Input
                    required
                    placeholder={t("tool_name_placeholder")}
                    className="h-16 px-6 rounded-2xl border-(--border) focus-visible:ring-indigo-600 font-bold text-lg"
                    value={formData.nama_alat}
                    onChange={e => setFormData({ ...formData, nama_alat: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary) ml-1">{t("category")}</label>
                    <select
                      required
                      className="w-full h-16 px-6 rounded-2xl border-2 border-(--border) focus:border-indigo-600 focus:outline-none font-bold text-(--text-primary) transition-all appearance-none bg-(--background)"
                      value={formData.kategori_id}
                      onChange={e => setFormData({ ...formData, kategori_id: e.target.value })}
                    >
                      <option value="">{t("select_category")}</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{translateCategory(c.nama_kategori)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary) ml-1">{t("initial_stock")}</label>
                    <Input
                      required
                      type="number"
                      min="0"
                      className="h-16 px-6 rounded-2xl border-(--border) focus-visible:ring-indigo-600 font-black text-lg"
                      value={formData.stok}
                      onChange={e => setFormData({ ...formData, stok: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary) ml-1">{t("description")}</label>
                  <textarea
                    className="w-full p-6 bg-(--background) border-2 border-(--border) rounded-2xl focus:border-indigo-600 focus:outline-none font-medium text-(--text-primary) transition-all min-h-[120px]"
                    placeholder={t("description_placeholder")}
                    value={formData.deskripsi}
                    onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--text-secondary) ml-1">{t("image_url")}</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        className="h-16 px-6 rounded-2xl border-(--border) focus-visible:ring-indigo-600 font-bold"
                        value={formData.gambar}
                        onChange={e => setFormData({ ...formData, gambar: e.target.value })}
                      />
                    </div>
                    {formData.gambar && (
                      <div className="w-16 h-16 rounded-2xl border-2 border-(--border) bg-(--background) overflow-hidden shadow-inner">
                        <img src={formData.gambar} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-10 pt-0 flex gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-16 rounded-2xl font-bold text-(--text-secondary) hover:bg-(--background)"
                  disabled={submitting}
                >
                  {t("cancel")}
                </Button>
                <Button
                  disabled={submitting}
                  className="flex-1 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 px-10"
                >
                  {submitting ? <RefreshCw className="animate-spin" /> : formData.id ? t("save_changes") : t("add_tool")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Detail Modal */}
      <EquipmentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        tool={selectedToolForDetail}
        modalMode="detail"
        setModalMode={() => { }}
        tanggalKembali=""
        setTanggalKembali={() => { }}
        handleBorrow={() => { }}
        submitting={false}
        isAdmin={true}
      />
    </div>
  );
}

export default function AlatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    }>
      <AlatContent />
    </Suspense>
  );
}
