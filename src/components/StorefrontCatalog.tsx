"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
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
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">(
    "featured"
  );
  const [justAddedKey, setJustAddedKey] = useState<string | null>(null);
  const { addItem } = useCart();

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (selectedCategory !== "all" && p.categories?.slug !== selectedCategory) {
        return false;
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
  }, [products, selectedCategory, search, sortBy]);

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

  return (
    <section id="shop" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10">
      {/* Clean Category Bar — all categories visible without clipping */}
      <div className="border-t border-b border-[#e5e5e5] py-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`py-1 text-sm border-b-2 transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "border-[#111111] text-[#111111] font-medium"
                : "border-transparent text-[#666666] hover:text-[#111111]"
            }`}
          >
            All ({products.length})
          </button>

          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`py-1 text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? "border-[#111111] text-[#111111] font-medium"
                    : "border-transparent text-[#666666] hover:text-[#111111]"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="text-xs text-[#777777] tabular-nums">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          </span>

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
      </div>

      {/* Product Grid — Focus 100% on the Clothing */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-base font-medium text-[#111111]">No items found</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearch("");
            }}
            className="mt-4 px-5 py-2.5 bg-[#111111] text-white text-sm font-medium cursor-pointer"
          >
            Show All Clothing
          </button>
        </div>
      ) : (
        <div className="pt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
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

                {/* Clean 2-line caption: Name + Price */}
                <div className="pt-3 flex items-start justify-between gap-3">
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-sm text-[#111111] group-hover:underline underline-offset-4 leading-snug"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-baseline gap-1.5 shrink-0 tabular-nums">
                    <span className={`text-sm font-medium ${hasDiscount ? "text-[#9b1c1c]" : "text-[#111111]"}`}>
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
    </section>
  );
}
