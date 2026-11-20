"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FolderPlus,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Upload,
  Calendar,
  Activity,
} from "lucide-react";
import type {
  AuditLog,
  Category,
  Order,
  OrderStatus,
  ProductWithCategory,
  TailoringInquiry,
} from "@/lib/types";
import { formatDateIST, formatINR, normalizeSku, ORDER_STATUS_LABELS, slugify } from "@/lib/format";

interface AdminDashboardProps {
  adminEmail: string;
  initialProducts: ProductWithCategory[];
  initialCategories: Category[];
  initialOrders: Order[];
  initialInquiries: TailoringInquiry[];
  initialAuditLogs: AuditLog[];
}

const ALL_SIZE_PRESETS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "Free Size",
  "Standard",
  "2-3Y",
  "4-5Y",
  "6-7Y",
  "8-9Y",
  "10-12Y",
];

const STUDIO_ASSET_PRESETS = [
  { label: "Ochre Wool Chuba", url: "/images/products/lhasa-camel-wool-chuba.jpg" },
  { label: "Crimson Brocade Chuba", url: "/images/products/potala-crimson-chuba.jpg" },
  { label: "Men's Obsidian Chuba", url: "/images/products/kham-obsidian-mens-chuba.jpg" },
  { label: "Men's Maroon Chuba", url: "/images/products/amdo-maroon-mens-chuba.jpg" },
  { label: "Rainbow Striped Pangden", url: "/images/products/handwoven-rainbow-pangden.jpg" },
  { label: "Aqua Mulberry Silk Wonju", url: "/images/products/glacial-aqua-silk-wonju.jpg" },
  { label: "Lotus Brocade Toethung", url: "/images/products/lotus-brocade-toethung-jacket.jpg" },
  { label: "Imperial Indigo Losar Chuba", url: "/images/products/imperial-indigo-losar-chuba.jpg" },
  { label: "Kids' Saffron Chuba", url: "/images/products/saffron-brocade-kids-chuba.jpg" },
  { label: "Silk Khata & Kagek Sash", url: "/images/products/ceremonial-khata-sash-set.jpg" },
];

export function AdminDashboard({
  adminEmail,
  initialProducts,
  initialCategories,
  initialOrders,
  initialInquiries,
  initialAuditLogs,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<"products" | "categories" | "orders" | "inquiries">("products");
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [inquiries, setInquiries] = useState<TailoringInquiry[]>(initialInquiries);
  const [auditLogs] = useState<AuditLog[]>(initialAuditLogs);

  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Product Form State (Create & Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [tibetanName, setTibetanName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("");
  const [careInstructions, setCareInstructions] = useState("Dry clean recommended.");
  const [priceRupees, setPriceRupees] = useState("");
  const [compareAtRupees, setCompareAtRupees] = useState("");
  const [stockQty, setStockQty] = useState("10");
  const [leadTimeDays, setLeadTimeDays] = useState("7");
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [allowCustom, setAllowCustom] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState(STUDIO_ASSET_PRESETS[0].url);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Category Form State
  const [catName, setCatName] = useState("");
  const [catTibetan, setCatTibetan] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catSort, setCatSort] = useState(String(initialCategories.length + 1));
  const [savingCat, setSavingCat] = useState(false);

  const resetProductForm = () => {
    setEditingId(null);
    setName("");
    setTibetanName("");
    setSlug("");
    setSku("");
    setCategoryId(categories[0]?.id ?? "");
    setDescription("");
    setFabric("");
    setCareInstructions("Dry clean recommended.");
    setPriceRupees("");
    setCompareAtRupees("");
    setStockQty("10");
    setLeadTimeDays("7");
    setSizes(["S", "M", "L", "XL"]);
    setAllowCustom(true);
    setIsFeatured(false);
    setIsActive(true);
    setImageUrl(STUDIO_ASSET_PRESETS[0].url);
  };

  const startEditing = (p: ProductWithCategory) => {
    setEditingId(p.id);
    setName(p.name);
    setTibetanName(p.tibetan_name);
    setSlug(p.slug);
    setSku(p.sku);
    setCategoryId(p.category_id);
    setDescription(p.description);
    setFabric(p.fabric);
    setCareInstructions(p.care_instructions);
    setPriceRupees(String(p.price_paise / 100));
    setCompareAtRupees(p.compare_at_paise ? String(p.compare_at_paise / 100) : "");
    setStockQty(String(p.stock_quantity));
    setLeadTimeDays(String(p.lead_time_days));
    setSizes(p.sizes);
    setAllowCustom(p.allow_custom_tailoring);
    setIsFeatured(p.is_featured);
    setIsActive(p.is_active);
    setImageUrl(p.image_url);
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSize = (sz: string) => {
    setSizes((prev) =>
      prev.includes(sz) ? prev.filter((x) => x !== sz) : [...prev, sz]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBanner(null);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: json.error ?? "Upload failed." });
        return;
      }
      setImageUrl(json.url);
      setBanner({
        type: "success",
        text: "Studio image verified (magic-bytes validated) and uploaded to Supabase Storage.",
      });
    } catch {
      setBanner({ type: "error", text: "Network error during image upload." });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (sizes.length === 0) {
      setBanner({ type: "error", text: "Select at least one available size." });
      return;
    }

    setSavingProduct(true);
    try {
      const payload = {
        name,
        tibetan_name: tibetanName,
        slug: slug || slugify(name),
        sku: normalizeSku(sku),
        category_id: categoryId,
        description,
        fabric,
        care_instructions: careInstructions,
        price_rupees: Number(priceRupees),
        compare_at_rupees: compareAtRupees ? Number(compareAtRupees) : null,
        stock_quantity: Number(stockQty),
        lead_time_days: Number(leadTimeDays),
        sizes,
        allow_custom_tailoring: allowCustom,
        image_url: imageUrl,
        is_featured: isFeatured,
        is_active: isActive,
      };

      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setBanner({ type: "error", text: json.error ?? "Failed to save product." });
        return;
      }

      if (editingId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? (json.product as ProductWithCategory) : p))
        );
        setBanner({ type: "success", text: `Updated "${json.product.name}" successfully.` });
      } else {
        setProducts((prev) => [json.product as ProductWithCategory, ...prev]);
        setBanner({ type: "success", text: `Created "${json.product.name}" and published to catalog.` });
      }

      resetProductForm();
    } catch {
      setBanner({ type: "error", text: "Network error while saving product." });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleToggleActive = async (product: ProductWithCategory) => {
    setBanner(null);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !product.is_active }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: json.error ?? "Could not update visibility." });
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? (json.product as ProductWithCategory) : p))
    );
  };

  const handleDeleteProduct = async (product: ProductWithCategory) => {
    if (!window.confirm(`Delete "${product.name}" permanently?`)) return;
    setBanner(null);
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: json.error ?? "Could not delete product." });
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setBanner({ type: "success", text: `Deleted "${product.name}".` });
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setSavingCat(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          tibetan_name: catTibetan,
          slug: catSlug || slugify(catName),
          description: catDesc,
          sort_order: Number(catSort) || 10,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: json.error ?? "Failed to add category." });
        return;
      }
      setCategories((prev) => [...prev, json.category as Category]);
      setCatName("");
      setCatTibetan("");
      setCatSlug("");
      setCatDesc("");
      setCatSort(String(categories.length + 2));
      setBanner({ type: "success", text: `Category "${json.category.name}" added.` });
    } finally {
      setSavingCat(false);
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    setBanner(null);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ type: "error", text: json.error ?? "Could not update order." });
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: json.order.status } : o))
    );
    setBanner({ type: "success", text: `Order ${json.order.order_number} marked "${status}".` });
  };

  const handleInquiryStatusChange = async (
    inquiryId: string,
    status: TailoringInquiry["status"]
  ) => {
    const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (res.ok) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: json.inquiry.status } : inq))
      );
    }
  };

  const totalRevenuePaise = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_paise, 0);

  return (
    <div className="space-y-8">
      {/* Header & KPI Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e8e3dc]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e2a2b]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Admin Atelier · RLS Enforced
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#171412] mt-1">
            S.S Tailors Studio Console
          </h1>
          <p className="text-xs text-[#6c635b] mt-1">
            Signed in as <span className="font-mono text-[#171412]">{adminEmail}</span>
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-[#dcd5ca] bg-white text-xs font-semibold uppercase tracking-[0.12em] hover:border-[#171412]"
        >
          View Live Storefront
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#ece7df] p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#7a7067]">Catalog Products</p>
          <p className="font-serif text-3xl font-semibold text-[#171412] mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#ece7df] p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#7a7067]">Tibetan Categories</p>
          <p className="font-serif text-3xl font-semibold text-[#171412] mt-1">{categories.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#ece7df] p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#7a7067]">Customer Orders</p>
          <p className="font-serif text-3xl font-semibold text-[#171412] mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#ece7df] p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#7a7067]">Order Volume</p>
          <p className="font-mono text-2xl font-semibold text-[#9e2a2b] mt-2">
            {formatINR(totalRevenuePaise)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#e8e3dc] pb-4">
        {(
          [
            ["products", "Products & Create", Package],
            ["categories", "Categories", FolderPlus],
            ["orders", `Orders (${orders.length})`, ShoppingBag],
            ["inquiries", `Fittings & Audit (${inquiries.length})`, Calendar],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setBanner(null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
              tab === id
                ? "bg-[#171412] text-white border-[#171412]"
                : "bg-white text-[#4b443e] border-[#e5dfd6] hover:border-[#171412]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {banner && (
        <div
          className={`px-4 py-3 rounded-2xl border text-xs font-medium flex items-center gap-2 ${
            banner.type === "success"
              ? "bg-[#f3f9f5] border-[#cde6d5] text-[#1f5139]"
              : "bg-[#fdf2f2] border-[#f5d0d0] text-[#9e2a2b]"
          }`}
        >
          {banner.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{banner.text}</span>
        </div>
      )}

      {/* TAB 1: PRODUCTS + CREATE PRODUCT */}
      {tab === "products" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Create / Edit Form */}
          <form
            onSubmit={handleSaveProduct}
            className="xl:col-span-5 bg-white rounded-3xl border border-[#e8e3dc] overflow-hidden shadow-xs"
          >
            <div className="px-6 py-5 bg-[#faf9f7] border-b border-[#eee9e2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#9e2a2b]" />
                <h2 className="font-serif text-2xl font-medium text-[#171412]">
                  {editingId ? "Edit Garment" : "Create New Product"}
                </h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="text-xs font-medium text-[#9e2a2b] hover:underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Studio Image Preview + Secure Upload */}
              <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#ece7df] space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-26 bg-white rounded-xl border border-[#e8e3dc] overflow-hidden shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-semibold text-[#171412] flex items-center gap-1.5">
                      <ImagePlus className="w-3.5 h-3.5 text-[#9e2a2b]" />
                      Studio Product Photo
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#171412] hover:bg-[#9e2a2b] text-white text-[11px] font-semibold cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingImage ? "Validating & Uploading..." : "Upload JPG / PNG / WebP"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-[#7a7067]">
                      Max 5 MB · Magic-byte verified · Stored in Supabase Storage
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#6c635b] mb-1">
                    Or pick an existing mannequin studio shot:
                  </label>
                  <select
                    value={STUDIO_ASSET_PRESETS.some((p) => p.url === imageUrl) ? imageUrl : ""}
                    onChange={(e) => {
                      if (e.target.value) setImageUrl(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] bg-white text-xs"
                  >
                    <option value="">Uploaded custom media</option>
                    {STUDIO_ASSET_PRESETS.map((preset) => (
                      <option key={preset.url} value={preset.url}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1">
                    Garment Name *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={160}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingId) setSlug(slugify(e.target.value));
                    }}
                    placeholder="Lhasa Silk Brocade Chuba"
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1">
                    Tibetan Name (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={tibetanName}
                    onChange={(e) => setTibetanName(e.target.value)}
                    placeholder="ཕྱུ་པ་"
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] bg-white text-sm focus:outline-none focus:border-[#9e2a2b]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(normalizeSku(e.target.value))}
                    placeholder="SST-WC-109"
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm font-mono uppercase focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4b443e] mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="lhasa-silk-brocade-chuba"
                  className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-xs font-mono focus:outline-none focus:border-[#9e2a2b]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={500000}
                    step="1"
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    placeholder="8500"
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm font-mono focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    min={2}
                    max={600000}
                    step="1"
                    value={compareAtRupees}
                    onChange={(e) => setCompareAtRupees(e.target.value)}
                    placeholder="9800"
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm font-mono focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={10000}
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm font-mono focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1">Lead (d)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={90}
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm font-mono focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4b443e] mb-1">Fabric *</label>
                <input
                  type="text"
                  required
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="Handwoven Pulu Wool & Varanasi Silk Brocade"
                  className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4b443e] mb-1">
                  Garment Description *
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  maxLength={3000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the silhouette, weave, brocade trim, and occasion..."
                  className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4b443e] mb-1">
                  Care Instructions
                </label>
                <input
                  type="text"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
                  Available Sizes *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SIZE_PRESETS.map((sz) => {
                    const selected = sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                          selected
                            ? "bg-[#171412] text-white border-[#171412]"
                            : "bg-white text-[#5d554d] border-[#e3ddd4] hover:border-[#171412]"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-5 pt-2 text-xs text-[#2d2824]">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCustom}
                    onChange={(e) => setAllowCustom(e.target.checked)}
                    className="accent-[#9e2a2b]"
                  />
                  Bespoke Custom Tailoring
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-[#9e2a2b]"
                  />
                  Atelier Pick (Featured)
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-[#9e2a2b]"
                  />
                  Visible in Storefront
                </label>
              </div>

              <button
                type="submit"
                disabled={savingProduct || uploadingImage}
                className="w-full py-3.5 px-6 rounded-full bg-[#171412] hover:bg-[#9e2a2b] disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer"
              >
                {savingProduct
                  ? "Saving to Supabase..."
                  : editingId
                    ? "Save Garment Changes"
                    : "Publish Product to Store"}
              </button>
            </div>
          </form>

          {/* Product Inventory Table */}
          <div className="xl:col-span-7 bg-white rounded-3xl border border-[#e8e3dc] overflow-hidden">
            <div className="px-6 py-5 bg-[#faf9f7] border-b border-[#eee9e2] flex items-center justify-between">
              <h2 className="font-serif text-2xl font-medium text-[#171412]">
                Catalog Inventory ({products.length})
              </h2>
            </div>

            <div className="divide-y divide-[#f0ebe4]">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 flex items-center gap-4 hover:bg-[#fcfbf9] transition-colors"
                >
                  <div className="w-16 h-20 rounded-xl bg-white border border-[#ece7df] overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-[#171412] truncate">
                        {product.name}
                      </span>
                      {!product.is_active && (
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium">
                          Hidden
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="px-2 py-0.5 rounded-full bg-[#fdf2f2] text-[#9e2a2b] text-[10px] font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6c635b] mt-0.5">
                      {product.categories?.name} · <span className="font-mono">{product.sku}</span> ·{" "}
                      Stock: <span className="font-mono font-medium">{product.stock_quantity}</span>
                    </p>
                    <p className="font-mono text-sm font-semibold text-[#171412] mt-1">
                      {formatINR(product.price_paise)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditing(product)}
                      title="Edit product"
                      aria-label={`Edit ${product.name}`}
                      className="p-2 rounded-lg text-[#4b443e] hover:bg-[#f4f1ec] hover:text-[#171412] cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(product)}
                      title={product.is_active ? "Hide from store" : "Show in store"}
                      aria-label={`Toggle visibility for ${product.name}`}
                      className="p-2 rounded-lg text-[#4b443e] hover:bg-[#f4f1ec] hover:text-[#171412] cursor-pointer"
                    >
                      {product.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[#9e2a2b]" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product)}
                      title="Delete product"
                      aria-label={`Delete ${product.name}`}
                      className="p-2 rounded-lg text-[#8c8278] hover:bg-[#fdf2f2] hover:text-[#9e2a2b] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {tab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleCreateCategory}
            className="lg:col-span-5 bg-white rounded-3xl border border-[#e8e3dc] p-6 space-y-4"
          >
            <h2 className="font-serif text-2xl font-medium text-[#171412]">
              Add Tibetan Garment Category
            </h2>
            <div>
              <label className="block text-xs font-medium text-[#4b443e] mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  setCatSlug(slugify(e.target.value));
                }}
                placeholder="Tibetan Hats & Boots (Shamo & Somba)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4b443e] mb-1">
                Tibetan Script / Term
              </label>
              <input
                type="text"
                value={catTibetan}
                onChange={(e) => setCatTibetan(e.target.value)}
                placeholder="ཞྭ་མོ་དང་ཟོམ་པ་"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#4b443e] mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(slugify(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4b443e] mb-1">Order</label>
                <input
                  type="number"
                  value={catSort}
                  onChange={(e) => setCatSort(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4b443e] mb-1">Description</label>
              <textarea
                rows={3}
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={savingCat}
              className="w-full py-3 rounded-full bg-[#171412] hover:bg-[#9e2a2b] text-white text-xs font-semibold uppercase tracking-[0.14em] cursor-pointer"
            >
              {savingCat ? "Adding..." : "Create Category"}
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e8e3dc] divide-y divide-[#f0ebe4]">
            {categories.map((cat) => (
              <div key={cat.id} className="p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-[#171412]">
                    {cat.name}{" "}
                    {cat.tibetan_name && (
                      <span className="text-xs text-[#9e2a2b] ml-1">{cat.tibetan_name}</span>
                    )}
                  </p>
                  <p className="text-xs text-[#6c635b] mt-1">{cat.description}</p>
                </div>
                <span className="font-mono text-[11px] text-[#7a7067] shrink-0">
                  /{cat.slug}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#e8e3dc] p-12 text-center text-sm text-[#6c635b]">
              No customer orders received yet.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#ece7df] p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#f0ebe4]">
                  <div>
                    <p className="font-mono text-sm font-semibold text-[#171412]">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-[#6c635b] mt-0.5">
                      {order.customer_name} · {order.customer_phone} · {order.customer_email}
                    </p>
                    <p className="text-[11px] text-[#8c8278] mt-0.5">
                      {formatDateIST(order.created_at)} ·{" "}
                      {order.fulfillment_method === "studio_pickup"
                        ? "Majnu Ka Tila Studio Pickup"
                        : `${order.shipping_address?.line1 ?? ""}, ${order.shipping_address?.city ?? ""} ${order.shipping_address?.postalCode ?? ""}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-semibold text-[#171412]">
                      {formatINR(order.total_paise)}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleOrderStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      aria-label={`Order status for ${order.order_number}`}
                      className="px-3 py-1.5 rounded-full border border-[#dcd5ca] bg-white text-xs font-medium cursor-pointer"
                    >
                      {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {(order.order_items ?? []).map((item) => (
                    <div key={item.id} className="flex justify-between text-[#4b443e]">
                      <span>
                        {item.product_name} ({item.size}) × {item.quantity}
                      </span>
                      <span className="font-mono">{formatINR(item.line_total_paise)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: FITTING INQUIRIES & SECURITY AUDIT LOG */}
      {tab === "inquiries" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e8e3dc] overflow-hidden">
            <div className="px-6 py-4 bg-[#faf9f7] border-b border-[#eee9e2]">
              <h2 className="font-serif text-xl font-medium text-[#171412]">
                Majnu Ka Tila Fitting Inquiries ({inquiries.length})
              </h2>
            </div>
            <div className="divide-y divide-[#f0ebe4]">
              {inquiries.length === 0 ? (
                <p className="p-8 text-center text-xs text-[#6c635b]">No fitting requests yet.</p>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#171412]">
                          {inq.name} · <span className="text-[#9e2a2b]">{inq.garment_type}</span>
                        </p>
                        <p className="text-xs text-[#6c635b]">
                          {inq.phone} · {inq.email}
                          {inq.preferred_date ? ` · Preferred: ${inq.preferred_date}` : ""}
                        </p>
                      </div>
                      <select
                        value={inq.status}
                        onChange={(e) =>
                          handleInquiryStatusChange(
                            inq.id,
                            e.target.value as TailoringInquiry["status"]
                          )
                        }
                        className="px-2.5 py-1 rounded-full border border-[#dcd5ca] text-[11px] bg-white"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    {inq.notes && <p className="text-xs text-[#5d554d]">{inq.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e8e3dc] overflow-hidden">
            <div className="px-6 py-4 bg-[#faf9f7] border-b border-[#eee9e2] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1f3a52]" />
              <h2 className="font-serif text-xl font-medium text-[#171412]">
                Immutable Security Audit Log
              </h2>
            </div>
            <div className="divide-y divide-[#f0ebe4] max-h-[480px] overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="p-6 text-xs text-[#6c635b]">
                  Admin actions (product creates, updates, uploads, status changes) will appear here.
                </p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="px-5 py-3 text-xs space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-[#1f3a52]">{log.action}</span>
                      <span className="text-[10px] text-[#8c8278]">
                        {formatDateIST(log.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6c635b] font-mono truncate">
                      {log.entity_type} · {log.entity_id}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
