"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Pencil, Trash2, Upload } from "lucide-react";
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

  // Product Form State
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
      setBanner({ type: "success", text: "Photo uploaded successfully." });
    } catch {
      setBanner({ type: "error", text: "Network error during upload." });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (sizes.length === 0) {
      setBanner({ type: "error", text: "Select at least one size." });
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
        setBanner({ type: "success", text: `Updated "${json.product.name}".` });
      } else {
        setProducts((prev) => [json.product as ProductWithCategory, ...prev]);
        setBanner({ type: "success", text: `Added "${json.product.name}" to the shop.` });
      }

      resetProductForm();
    } catch {
      setBanner({ type: "error", text: "Network error while saving." });
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
    if (!window.confirm(`Delete "${product.name}"?`)) return;
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
        setBanner({ type: "error", text: json.error ?? "Failed to create category." });
        return;
      }
      setCategories((prev) => [...prev, json.category as Category]);
      setCatName("");
      setCatTibetan("");
      setCatSlug("");
      setCatDesc("");
      setCatSort(String(categories.length + 2));
      setBanner({ type: "success", text: `Added category "${json.category.name}".` });
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
    setBanner({ type: "success", text: `Order ${json.order.order_number} updated to ${status}.` });
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111]">S.S Tailors Admin</h1>
          <p className="text-sm text-[#666666] mt-1">{adminEmail}</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 border border-[#d4d4d4] text-sm font-medium text-[#111111] hover:border-[#111111] self-start sm:self-auto"
        >
          View Store
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#e5e5e5] p-4">
          <p className="text-xs text-[#666666]">Products</p>
          <p className="text-2xl font-semibold text-[#111111] mt-1 tabular-nums">{products.length}</p>
        </div>
        <div className="border border-[#e5e5e5] p-4">
          <p className="text-xs text-[#666666]">Categories</p>
          <p className="text-2xl font-semibold text-[#111111] mt-1 tabular-nums">{categories.length}</p>
        </div>
        <div className="border border-[#e5e5e5] p-4">
          <p className="text-xs text-[#666666]">Orders</p>
          <p className="text-2xl font-semibold text-[#111111] mt-1 tabular-nums">{orders.length}</p>
        </div>
        <div className="border border-[#e5e5e5] p-4">
          <p className="text-xs text-[#666666]">Order Total</p>
          <p className="text-2xl font-semibold text-[#111111] mt-1 tabular-nums">
            {formatINR(totalRevenuePaise)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#e5e5e5] overflow-x-auto no-scrollbar">
        {(
          [
            ["products", "Products"],
            ["categories", "Categories"],
            ["orders", `Orders (${orders.length})`],
            ["inquiries", `Fittings & Log (${inquiries.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setBanner(null);
            }}
            className={`pb-3 text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              tab === id
                ? "border-[#111111] text-[#111111] font-medium"
                : "border-transparent text-[#666666] hover:text-[#111111]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {banner && (
        <div
          className={`px-4 py-3 border text-sm ${
            banner.type === "success"
              ? "bg-[#f5faf6] border-[#c8e6cf] text-[#1d5e31]"
              : "bg-[#fef2f2] border-[#f5c6c6] text-[#9b1c1c]"
          }`}
        >
          {banner.text}
        </div>
      )}

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleSaveProduct} className="xl:col-span-5 border border-[#e5e5e5] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eeeeee]">
              <h2 className="text-base font-semibold text-[#111111]">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="text-xs text-[#9b1c1c] hover:underline cursor-pointer"
                >
                  Cancel edit
                </button>
              )}
            </div>

            {/* Image Upload */}
            <div className="p-4 bg-[#f7f7f5] border border-[#e5e5e5] space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-18 aspect-[3/4] bg-white border border-[#e5e5e5] overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] hover:bg-[#9b1c1c] text-white text-xs font-medium cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage ? "Uploading..." : "Upload Product Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-[#666666]">JPG, PNG, or WebP up to 5 MB</p>
                </div>
              </div>

              <select
                value={STUDIO_ASSET_PRESETS.some((p) => p.url === imageUrl) ? imageUrl : ""}
                onChange={(e) => {
                  if (e.target.value) setImageUrl(e.target.value);
                }}
                className="w-full px-3 py-2 border border-[#d4d4d4] bg-white text-xs"
              >
                <option value="">Custom uploaded photo</option>
                {STUDIO_ASSET_PRESETS.map((preset) => (
                  <option key={preset.url} value={preset.url}>
                    Use catalog photo: {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1">
                  Product Name *
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
                  placeholder="Silk Brocade Chuba"
                  className="w-full px-3 py-2 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1">
                  Tibetan Name (optional)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={tibetanName}
                  onChange={(e) => setTibetanName(e.target.value)}
                  placeholder="ཕྱུ་པ་"
                  className="w-full px-3 py-2 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1">Category *</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d4d4d4] bg-white text-sm focus:outline-none focus:border-[#111111]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1">SKU *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(normalizeSku(e.target.value))}
                  placeholder="SST-WC-109"
                  className="w-full px-3 py-2 border border-[#d4d4d4] text-sm uppercase focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="silk-brocade-chuba"
                className="w-full px-3 py-2 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={500000}
                  value={priceRupees}
                  onChange={(e) => setPriceRupees(e.target.value)}
                  placeholder="8500"
                  className="w-full px-3 py-2 border border-[#d4d4d4] text-sm tabular-nums focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1">MRP (₹)</label>
                <input
                  type="number"
                  min={2}
                  max={600000}
                  value={compareAtRupees}
                  onChange={(e) => setCompareAtRupees(e.target.value)}
                  placeholder="9800"
                  className="w-full px-3 py-2 border border-[#d4d4d4] text-sm tabular-nums focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1">Stock *</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={10000}
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d4d4d4] text-sm tabular-nums focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1">Days</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={90}
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d4d4d4] text-sm tabular-nums focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1">Fabric *</label>
              <input
                type="text"
                required
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="Pulu wool, silk brocade, mulberry silk..."
                className="w-full px-3 py-2 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1">Description *</label>
              <textarea
                rows={3}
                required
                minLength={10}
                maxLength={3000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the garment, fit, and occasion"
                className="w-full px-3 py-2 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1">Care</label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1.5">Sizes *</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SIZE_PRESETS.map((sz) => {
                  const selected = sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-2.5 py-1 text-xs border transition-colors cursor-pointer ${
                        selected
                          ? "bg-[#111111] text-white border-[#111111]"
                          : "bg-white text-[#444444] border-[#d4d4d4] hover:border-[#111111]"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-5 pt-2 text-xs text-[#222222]">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCustom}
                  onChange={(e) => setAllowCustom(e.target.checked)}
                />
                Allow custom stitching
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Visible in store
              </label>
            </div>

            <button
              type="submit"
              disabled={savingProduct || uploadingImage}
              className="w-full py-3 px-6 bg-[#111111] hover:bg-[#9b1c1c] disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {savingProduct ? "Saving..." : editingId ? "Save Changes" : "Create Product"}
            </button>
          </form>

          {/* Inventory List */}
          <div className="xl:col-span-7 border border-[#e5e5e5] divide-y divide-[#eeeeee]">
            <div className="px-5 py-4 bg-[#f7f7f5]">
              <h2 className="text-base font-semibold text-[#111111]">
                All Products ({products.length})
              </h2>
            </div>

            {products.map((product) => (
              <div key={product.id} className="p-4 flex items-center gap-4">
                <div className="w-14 aspect-[3/4] bg-[#f5f5f3] overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#111111] truncate">
                      {product.name}
                    </span>
                    {!product.is_active && (
                      <span className="px-2 py-0.5 bg-[#eeeeee] text-[#555555] text-[11px]">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666666] mt-0.5">
                    {product.categories?.name} · {product.sku} · Stock: {product.stock_quantity}
                  </p>
                  <p className="text-sm font-medium tabular-nums text-[#111111] mt-0.5">
                    {formatINR(product.price_paise)}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditing(product)}
                    title="Edit"
                    aria-label={`Edit ${product.name}`}
                    className="p-2 text-[#555555] hover:text-[#111111] cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(product)}
                    title={product.is_active ? "Hide" : "Show"}
                    aria-label={`Toggle ${product.name}`}
                    className="p-2 text-[#555555] hover:text-[#111111] cursor-pointer"
                  >
                    {product.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#9b1c1c]" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product)}
                    title="Delete"
                    aria-label={`Delete ${product.name}`}
                    className="p-2 text-[#777777] hover:text-[#9b1c1c] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {tab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleCreateCategory} className="lg:col-span-5 border border-[#e5e5e5] p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#111111]">Add Category</h2>
            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1">Name *</label>
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  setCatSlug(slugify(e.target.value));
                }}
                placeholder="Tibetan Hats & Boots"
                className="w-full px-3 py-2 border border-[#d4d4d4] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1">
                Tibetan Name (optional)
              </label>
              <input
                type="text"
                value={catTibetan}
                onChange={(e) => setCatTibetan(e.target.value)}
                className="w-full px-3 py-2 border border-[#d4d4d4] text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#444444] mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(slugify(e.target.value))}
                  className="w-full px-3 py-2 border border-[#d4d4d4] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1">Order</label>
                <input
                  type="number"
                  value={catSort}
                  onChange={(e) => setCatSort(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d4d4d4] text-sm tabular-nums"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1">Description</label>
              <textarea
                rows={3}
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                className="w-full px-3 py-2 border border-[#d4d4d4] text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={savingCat}
              className="w-full py-2.5 bg-[#111111] hover:bg-[#9b1c1c] text-white text-sm font-medium cursor-pointer"
            >
              {savingCat ? "Adding..." : "Add Category"}
            </button>
          </form>

          <div className="lg:col-span-7 border border-[#e5e5e5] divide-y divide-[#eeeeee]">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#111111]">{cat.name}</p>
                  <p className="text-xs text-[#666666] mt-0.5">{cat.description}</p>
                </div>
                <span className="text-xs text-[#888888] shrink-0">/{cat.slug}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="border border-[#e5e5e5] p-10 text-center text-sm text-[#666666]">
              No orders yet.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="border border-[#e5e5e5] p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#eeeeee]">
                  <div>
                    <p className="text-sm font-semibold text-[#111111] tabular-nums">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-[#555555]">
                      {order.customer_name} · {order.customer_phone} · {order.customer_email}
                    </p>
                    <p className="text-xs text-[#777777] mt-0.5">
                      {formatDateIST(order.created_at)} ·{" "}
                      {order.fulfillment_method === "studio_pickup"
                        ? "Majnu Ka Tila Pickup"
                        : `${order.shipping_address?.line1 ?? ""}, ${order.shipping_address?.city ?? ""} ${order.shipping_address?.postalCode ?? ""}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums text-[#111111]">
                      {formatINR(order.total_paise)}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleOrderStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      aria-label={`Order status for ${order.order_number}`}
                      className="px-3 py-1.5 border border-[#d4d4d4] bg-white text-xs cursor-pointer"
                    >
                      {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[#444444]">
                  {(order.order_items ?? []).map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.product_name} ({item.size}) × {item.quantity}
                      </span>
                      <span className="tabular-nums">{formatINR(item.line_total_paise)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* INQUIRIES & AUDIT LOG TAB */}
      {tab === "inquiries" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 border border-[#e5e5e5] divide-y divide-[#eeeeee]">
            <div className="px-5 py-3.5 bg-[#f7f7f5]">
              <h2 className="text-sm font-semibold text-[#111111]">
                Fitting Requests ({inquiries.length})
              </h2>
            </div>
            {inquiries.length === 0 ? (
              <p className="p-8 text-center text-sm text-[#666666]">No requests yet.</p>
            ) : (
              inquiries.map((inq) => (
                <div key={inq.id} className="p-4 space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#111111]">
                        {inq.name} — {inq.garment_type}
                      </p>
                      <p className="text-xs text-[#666666]">
                        {inq.phone} · {inq.email}
                        {inq.preferred_date ? ` · ${inq.preferred_date}` : ""}
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
                      className="px-2.5 py-1 border border-[#d4d4d4] text-xs bg-white"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  {inq.notes && <p className="text-xs text-[#555555]">{inq.notes}</p>}
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-5 border border-[#e5e5e5] divide-y divide-[#eeeeee]">
            <div className="px-5 py-3.5 bg-[#f7f7f5]">
              <h2 className="text-sm font-semibold text-[#111111]">Admin Activity Log</h2>
            </div>
            <div className="max-h-[460px] overflow-y-auto divide-y divide-[#eeeeee]">
              {auditLogs.length === 0 ? (
                <p className="p-6 text-xs text-[#666666]">No admin activity yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="px-4 py-3 text-xs space-y-0.5">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-[#111111]">{log.action}</span>
                      <span className="text-[#777777]">{formatDateIST(log.created_at)}</span>
                    </div>
                    <p className="text-[#666666] truncate">
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
