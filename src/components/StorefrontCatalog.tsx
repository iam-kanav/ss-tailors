"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Category, ProductWithCategory } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { useCart } from "@/components/CartProvider";

interface StorefrontCatalogProps {
  categories: Category[];
  products: ProductWithCategory[];
  initialCategory?: string;
}

type PriceRangeKey = "under-5000" | "5000-10000" | "above-10000";

const PRICE_RANGES: { key: PriceRangeKey; label: string; test: (paise: number) => boolean }[] = [
  { key: "under-5000", label: "Under ₹5,000", test: (p) => p < 500000 },
  { key: "5000-10000", label: "₹5,000 – ₹10,000", test: (p) => p >= 500000 && p <= 1000000 },
  { key: "above-10000", label: "Above ₹10,000", test: (p) => p > 1000000 },
];

export function StorefrontCatalog({
  categories,
  products,
  initialCategory = "all",
}: StorefrontCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRangeKey[]>([]);
  const [customOnly, setCustomOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">(
    "featured"
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [justAddedKey, setJustAddedKey] = useState<string | null>(null);
  const { addItem } = useCart();

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const slug = p.categories?.slug;
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const togglePriceRange = (key: PriceRangeKey) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedPriceRanges.length > 0 ||
    customOnly ||
    search.trim().length > 0;

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setSelectedPriceRanges([]);
    setCustomOnly(false);
    setSearch("");
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (selectedCategory !== "all" && p.categories?.slug !== selectedCategory) {
        return false;
      }
      if (customOnly && !p.allow_custom_tailoring) {
        return false;
      }
      if (selectedPriceRanges.length > 0) {
        const matchesAny = selectedPriceRanges.some((key) => {
          const def = PRICE_RANGES.find((r) => r.key === key);
          return def ? def.test(p.price_paise) : false;
        });
        if (!matchesAny) return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        (p.categories?.name.toLowerCase().includes(q) ?? false)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === "price-asc") return a.price_paise - b.price_paise;
      if (sortBy === "price-desc") return b.price_paise - a.price_paise;
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, selectedCategory, selectedPriceRanges, customOnly, search, sortBy]);

  const handleSizeQuickAdd = (product: ProductWithCategory, size: string) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      imageUrl: product.image_url,
      pricePaise: product.price_paise,
      size,
      quantity: 1,
      isCustomTailored: false,
      maxStock: product.stock_quantity,
    });
    const key = `${product.id}-${size}`;
    setJustAddedKey(key);
    setTimeout(() => setJustAddedKey((curr) => (curr === key ? null : curr)), 1200);
  };

  const filterSidebarContent = (
    <div className="space-y-7">
      {/* Category List */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#777777] mb-3">
          Category
        </h2>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setMobileFiltersOpen(false);
              }}
              className={`w-full flex items-center justify-between py-1.5 text-sm text-left transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "text-[#111111] font-semibold"
                  : "text-[#555555] hover:text-[#111111]"
              }`}
            >
              <span>All Clothing</span>
              <span className="text-xs text-[#888888] tabular-nums">{products.length}</span>
            </button>
          </li>
          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            const count = categoryCounts.get(cat.slug) ?? 0;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setMobileFiltersOpen(false);
                  }}
                  className={`w-full flex items-baseline justify-between gap-2 py-1.5 text-sm text-left transition-colors cursor-pointer ${
                    active
                      ? "text-[#111111] font-semibold"
                      : "text-[#555555] hover:text-[#111111]"
                  }`}
                >
                  <span className="leading-snug">{cat.name}</span>
                  <span className="text-xs text-[#888888] tabular-nums shrink-0">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price Filter */}
      <div className="pt-5 border-t border-[#eeeeee]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#777777] mb-3">
          Price
        </h2>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label
              key={range.key}
              className="flex items-center gap-2.5 text-sm text-[#444444] hover:text-[#111111] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedPriceRanges.includes(range.key)}
                onChange={() => togglePriceRange(range.key)}
                className="accent-[#111111] w-3.5 h-3.5 cursor-pointer"
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tailoring Filter */}
      <div className="pt-5 border-t border-[#eeeeee]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#777777] mb-3">
          Tailoring
        </h2>
        <label className="flex items-center gap-2.5 text-sm text-[#444444] hover:text-[#111111] cursor-pointer">
          <input
            type="checkbox"
            checked={customOnly}
            onChange={(e) => setCustomOnly(e.target.checked)}
            className="accent-[#111111] w-3.5 h-3.5 cursor-pointer"
          />
          <span>Custom Stitched Available</span>
        </label>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetAllFilters}
          className="text-xs text-[#9b1c1c] underline underline-offset-4 hover:text-[#111111] cursor-pointer"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <section id="shop" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Desktop Classic Left Filter Sidebar (Option 3) */}
        <aside className="hidden lg:block lg:col-span-3 border-r border-[#ececea] pr-6 sticky top-24">
          {filterSidebarContent}
        </aside>

        {/* Right Main Catalog Column */}
        <div className="lg:col-span-9">
          {/* Clean Top Toolbar */}
          <div className="pb-4 border-b border-[#e5e5e5] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#d4d4d4] text-sm text-[#111111] cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
              <span className="text-sm text-[#555555] tabular-nums">
                Showing {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex items-center border-b border-[#d4d4d4] focus-within:border-[#111111]">
                <Search className="w-3.5 h-3.5 text-[#777777] shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clothing"
                  aria-label="Search clothing"
                  className="w-36 sm:w-48 pl-2 pr-5 py-1 text-sm text-[#111111] placeholder:text-[#888888] bg-transparent focus:outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-0 text-[#777777] hover:text-[#111111] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                aria-label="Sort products"
                className="text-sm text-[#333333] bg-transparent border-b border-[#d4d4d4] py-1 focus:outline-none focus:border-[#111111] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Mobile Expandable Filter Panel */}
          {mobileFiltersOpen && (
            <div className="lg:hidden mt-4 p-5 bg-[#f7f7f5] border border-[#e5e5e5]">
              {filterSidebarContent}
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-base font-medium text-[#111111]">No matching items found</p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-4 px-5 py-2.5 bg-[#111111] text-white text-sm font-medium cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="pt-7 grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10">
              {filteredProducts.map((product) => {
                const hasDiscount =
                  product.compare_at_paise && product.compare_at_paise > product.price_paise;
                const outOfStock = product.stock_quantity <= 0;

                return (
                  <article key={product.id} className="group flex flex-col">
                    <div className="relative aspect-[3/4] bg-[#f5f5f3] overflow-hidden">
                      <Link href={`/products/${product.slug}`} className="block w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </Link>

                      {!outOfStock ? (
                        <div className="hidden sm:block absolute inset-x-0 bottom-0 bg-white/95 border-t border-[#e5e5e5] px-3 py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-150">
                          <p className="text-[11px] text-[#666666] text-center mb-1.5">Quick add</p>
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {product.sizes.slice(0, 6).map((sz) => {
                              const added = justAddedKey === `${product.id}-${sz}`;
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => handleSizeQuickAdd(product, sz)}
                                  className={`min-w-[30px] px-2 py-1 text-xs transition-colors cursor-pointer ${
                                    added
                                      ? "bg-[#111111] text-white"
                                      : "text-[#111111] hover:bg-[#111111] hover:text-white"
                                  }`}
                                >
                                  {added ? "✓" : sz}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="absolute bottom-3 left-3 bg-white px-2.5 py-1 text-xs text-[#444444]">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <div className="pt-3 flex items-start justify-between gap-3">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-sm text-[#111111] group-hover:underline underline-offset-4 leading-snug"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-baseline gap-1.5 shrink-0 tabular-nums">
                        <span
                          className={`text-sm font-medium ${
                            hasDiscount ? "text-[#9b1c1c]" : "text-[#111111]"
                          }`}
                        >
                          {formatINR(product.price_paise)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-[#888888] line-through">
                            {formatINR(product.compare_at_paise!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
