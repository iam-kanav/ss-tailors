"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, ShoppingBag, Sparkles, Check } from "lucide-react";
import type { Category, ProductWithCategory } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { useCart } from "@/components/CartProvider";

interface StorefrontCatalogProps {
  categories: Category[];
  products: ProductWithCategory[];
  initialCategory?: string;
}

export function StorefrontCatalog({
  categories,
  products,
  initialCategory = "all",
}: StorefrontCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);
  const { addItem } = useCart();

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const slug = p.categories?.slug;
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const activeCategoryObj = useMemo(
    () => categories.find((c) => c.slug === selectedCategory) ?? null,
    [categories, selectedCategory]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (selectedCategory !== "all" && p.categories?.slug !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.tibetan_name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
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
  }, [products, selectedCategory, search, sortBy]);

  const handleQuickAdd = (product: ProductWithCategory) => {
    const defaultSize = product.sizes[0] ?? "M";
    addItem({
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      imageUrl: product.image_url,
      pricePaise: product.price_paise,
      size: defaultSize,
      quantity: 1,
      isCustomTailored: false,
      maxStock: product.stock_quantity,
    });
    setQuickAddedId(product.id);
    setTimeout(() => {
      setQuickAddedId((curr) => (curr === product.id ? null : curr));
    }, 1500);
  };

  return (
    <section id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#e8e3dc]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e2a2b]">
            The Atelier Catalog
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-medium text-[#171412] mt-2 leading-tight">
            {activeCategoryObj ? activeCategoryObj.name : "Authentic Tibetan Garments"}
          </h2>
          <p className="text-sm text-[#6c635b] mt-2 max-w-2xl">
            {activeCategoryObj
              ? activeCategoryObj.description
              : "Every Chuba, Pangden, Wonju, and Brocade jacket is individually pattern-cut in our Majnu Ka Tila workshop—available in standard tailoring or bespoke to your measurements."}
          </p>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8c8278] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Chuba, Pangden, silk..."
              aria-label="Search garments"
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#e3ddd4] text-sm text-[#171412] placeholder:text-[#9c9288] focus:outline-none focus:border-[#9e2a2b] transition-colors"
            />
          </div>

          <div className="relative inline-flex items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7a7067] absolute left-3.5 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort products"
              className="w-full sm:w-auto pl-9 pr-8 py-2.5 rounded-full bg-white border border-[#e3ddd4] text-xs font-medium text-[#2d2824] focus:outline-none focus:border-[#9e2a2b] appearance-none cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pill Filter Bar */}
      <div id="categories" className="py-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wide border transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-[#171412] text-white border-[#171412] shadow-sm"
              : "bg-white text-[#4b443e] border-[#e5dfd6] hover:border-[#171412]"
          }`}
        >
          All Garments ({products.length})
        </button>

        {categories.map((cat) => {
          const count = categoryCounts.get(cat.slug) ?? 0;
          const active = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wide border transition-all cursor-pointer ${
                active
                  ? "bg-[#9e2a2b] text-white border-[#9e2a2b] shadow-sm"
                  : "bg-white text-[#4b443e] border-[#e5dfd6] hover:border-[#9e2a2b]/60 hover:text-[#171412]"
              }`}
            >
              {cat.name}
              <span className={`ml-1.5 font-mono text-[10px] ${active ? "text-white/80" : "text-[#8e847a]"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="my-12 py-20 px-6 bg-white rounded-2xl border border-[#ece7df] text-center">
          <p className="font-serif text-2xl text-[#171412]">No garments match your filter</p>
          <p className="text-sm text-[#6c635b] mt-2">
            Try switching categories or clearing your search to explore our full Majnu Ka Tila collection.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearch("");
            }}
            className="mt-6 px-5 py-2.5 rounded-full bg-[#171412] text-white text-xs font-medium tracking-wide hover:bg-[#9e2a2b] transition-colors cursor-pointer"
          >
            View All Garments
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pt-2">
          {filteredProducts.map((product) => {
            const hasDiscount =
              product.compare_at_paise && product.compare_at_paise > product.price_paise;
            const outOfStock = product.stock_quantity <= 0;

            return (
              <article
                key={product.id}
                className="group flex flex-col bg-white rounded-2xl border border-[#ece7df] overflow-hidden hover:border-[#d5ccc0] hover:shadow-[0_14px_40px_-20px_rgba(23,20,18,0.18)] transition-all duration-300"
              >
                {/* Studio Mannequin Frame on Pure White */}
                <div className="relative aspect-[3/4] bg-[#f8f8f6] overflow-hidden">
                  <Link href={`/products/${product.slug}`} className="block w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image_url}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                    />
                  </Link>

                  {/* Top subtle badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    {product.is_featured && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#171412]/90 text-white text-[10px] font-medium uppercase tracking-[0.12em]">
                        Atelier Pick
                      </span>
                    )}
                    {product.allow_custom_tailoring && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 border border-[#e8e3dc] text-[#5e554e] text-[10px] font-medium">
                        <Sparkles className="w-2.5 h-2.5 text-[#c8922e]" />
                        Custom Fit
                      </span>
                    )}
                  </div>

                  {outOfStock && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="px-4 py-1.5 rounded-full bg-[#171412] text-white text-xs font-medium tracking-wider uppercase">
                        Made to Order
                      </span>
                    </div>
                  )}

                  {/* Subtle hover Quick Add */}
                  {!outOfStock && (
                    <div className="absolute inset-x-3 bottom-3 opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-250">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        className="w-full py-2.5 px-4 rounded-full bg-[#171412]/95 hover:bg-[#9e2a2b] text-white text-[11px] font-semibold uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5 backdrop-blur-sm shadow-sm transition-colors cursor-pointer"
                      >
                        {quickAddedId === product.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Added to Bag
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Quick Add ({product.sizes[0] ?? "M"})
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col border-t border-[#f3efe9]">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[#7e746a]">
                    <span className="uppercase tracking-[0.1em] truncate">
                      {product.categories?.name ?? "Tibetan Wear"}
                    </span>
                    {product.tibetan_name && (
                      <span className="text-[#9e2a2b]/80 truncate max-w-[115px]">
                        {product.tibetan_name}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-1.5 font-serif text-xl font-medium text-[#171412] group-hover:text-[#9e2a2b] transition-colors leading-snug line-clamp-2"
                  >
                    {product.name}
                  </Link>

                  <p className="mt-1 text-xs text-[#6c635b] line-clamp-1">{product.fabric}</p>

                  <div className="mt-auto pt-4 flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-base font-semibold text-[#171412]">
                        {formatINR(product.price_paise)}
                      </span>
                      {hasDiscount && (
                        <span className="font-mono text-xs text-[#9c9288] line-through">
                          {formatINR(product.compare_at_paise!)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#7a7067]">
                      {product.lead_time_days}d tailor time
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
