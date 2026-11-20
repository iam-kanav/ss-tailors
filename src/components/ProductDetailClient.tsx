"use client";

import { useState } from "react";
import { Check, Minus, Plus, Ruler, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import type { ProductWithCategory } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { useCart } from "@/components/CartProvider";

export function ProductDetailClient({ product }: { product: ProductWithCategory }) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] ?? "M");
  const [isCustom, setIsCustom] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const outOfStock = product.stock_quantity <= 0;
  const hasDiscount =
    product.compare_at_paise && product.compare_at_paise > product.price_paise;
  const discountPct = hasDiscount
    ? Math.round(((product.compare_at_paise! - product.price_paise) / product.compare_at_paise!) * 100)
    : 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      imageUrl: product.image_url,
      pricePaise: product.price_paise,
      size: isCustom ? "Custom Tailored" : selectedSize,
      quantity,
      isCustomTailored: isCustom,
      maxStock: product.stock_quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
      {/* Studio Mannequin Photograph */}
      <div className="lg:col-span-7 bg-[#f8f8f6] rounded-3xl border border-[#ece7df] overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full max-h-[720px] object-contain"
        />
      </div>

      {/* Product Specification & Purchase Controls */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#7e746a]">
            <span className="uppercase tracking-[0.14em] font-medium text-[#9e2a2b]">
              {product.categories?.name ?? "Tibetan Garment"}
            </span>
            {product.tibetan_name && (
              <>
                <span>·</span>
                <span>{product.tibetan_name}</span>
              </>
            )}
            <span>·</span>
            <span className="font-mono">{product.sku}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#171412] mt-2 leading-tight">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-semibold text-[#171412]">
              {formatINR(product.price_paise)}
            </span>
            {hasDiscount && (
              <>
                <span className="font-mono text-sm text-[#9c9288] line-through">
                  {formatINR(product.compare_at_paise!)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#fdf2f2] text-[#9e2a2b] text-[11px] font-semibold">
                  Save {discountPct}%
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-[#6c635b] mt-1">
            Inclusive of all taxes · Tailoring lead time: {product.lead_time_days} days
          </p>
        </div>

        <p className="text-sm text-[#4b443e] leading-relaxed">{product.description}</p>

        {/* Fit Mode Selector */}
        <div className="space-y-3 pt-2 border-t border-[#ece7df]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#171412]">
              Select Fit &amp; Size
            </span>
            <span className="text-xs text-[#6c635b]">
              {outOfStock ? "Out of stock" : `${product.stock_quantity} available`}
            </span>
          </div>

          {product.allow_custom_tailoring && (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsCustom(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  !isCustom
                    ? "bg-[#171412] text-white border-[#171412]"
                    : "bg-white text-[#4b443e] border-[#e3ddd4] hover:border-[#171412]"
                }`}
              >
                <span className="block font-semibold">Standard Size</span>
                <span className={`block text-[10px] mt-0.5 ${!isCustom ? "text-white/75" : "text-[#7a7067]"}`}>
                  Ready atelier proportions
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  isCustom
                    ? "bg-[#9e2a2b] text-white border-[#9e2a2b]"
                    : "bg-white text-[#4b443e] border-[#e3ddd4] hover:border-[#9e2a2b]"
                }`}
              >
                <span className="flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  Bespoke Custom Fit
                </span>
                <span className={`block text-[10px] mt-0.5 ${isCustom ? "text-white/80" : "text-[#7a7067]"}`}>
                  Complimentary custom cut
                </span>
              </button>
            </div>
          )}

          {!isCustom ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[52px] px-4 py-2.5 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
                    selectedSize === size
                      ? "bg-[#171412] text-white border-[#171412]"
                      : "bg-white text-[#2d2824] border-[#e3ddd4] hover:border-[#171412]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#faf9f7] border border-[#e8e3dc] text-xs text-[#4b443e] flex gap-3">
              <Ruler className="w-4 h-4 text-[#9e2a2b] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Enter your Chest, Waist, Shoulder, Sleeve, and Length measurements securely at
                checkout—or choose <span className="font-semibold">Majnu Ka Tila Studio Pickup</span> for
                an in-person trial with our master tailor.
              </p>
            </div>
          )}
        </div>

        {/* Quantity + CTA */}
        <div className="flex items-center gap-3 pt-2">
          <div className="inline-flex items-center border border-[#dcd5ca] bg-white rounded-full h-12">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="px-3.5 text-[#4b443e] hover:text-[#171412] cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-mono text-sm font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() =>
                setQuantity((q) => Math.min(20, Math.min(Math.max(1, product.stock_quantity), q + 1)))
              }
              aria-label="Increase quantity"
              className="px-3.5 text-[#4b443e] hover:text-[#171412] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex-1 h-12 rounded-full bg-[#171412] hover:bg-[#9e2a2b] disabled:bg-[#b7afa6] text-white text-xs font-semibold uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {outOfStock ? (
              "Currently Out of Stock"
            ) : added ? (
              <>
                <Check className="w-4 h-4" />
                Added to Bag
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Add to Bag · {formatINR(product.price_paise * quantity)}
              </>
            )}
          </button>
        </div>

        {/* Material & Care Specifications */}
        <div className="rounded-2xl bg-white border border-[#ece7df] divide-y divide-[#f0ebe4] text-xs">
          <div className="p-4 flex justify-between gap-4">
            <span className="text-[#7a7067] font-medium">Fabric</span>
            <span className="text-[#171412] text-right">{product.fabric}</span>
          </div>
          <div className="p-4 flex justify-between gap-4">
            <span className="text-[#7a7067] font-medium">Garment Care</span>
            <span className="text-[#171412] text-right">{product.care_instructions}</span>
          </div>
          <div className="p-4 flex items-center gap-3 text-[#4b443e]">
            <Truck className="w-4 h-4 text-[#c8922e] shrink-0" />
            <span>Free insured Pan-India courier over ₹5,000 or free studio pickup in Majnu Ka Tila.</span>
          </div>
          <div className="p-4 flex items-center gap-3 text-[#4b443e]">
            <ShieldCheck className="w-4 h-4 text-[#1f3a52] shrink-0" />
            <span>Prices &amp; inventory are locked and validated server-side upon order placement.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
