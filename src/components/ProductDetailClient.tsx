"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
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
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
      {/* Main Garment Photo */}
      <div className="lg:col-span-6 aspect-[3/4] max-w-[620px] w-full mx-auto bg-[#f5f5f3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Product Info & Add to Bag */}
      <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
        <div className="space-y-2">
          <p className="text-xs text-[#666666]">
            {product.categories?.name}
            {product.tibetan_name ? ` · ${product.tibetan_name}` : ""}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
            {product.name}
          </h1>

          <div className="pt-1 flex items-baseline gap-2.5 tabular-nums">
            <span
              className={`text-xl font-semibold ${
                hasDiscount ? "text-[#9b1c1c]" : "text-[#111111]"
              }`}
            >
              {formatINR(product.price_paise)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-[#888888] line-through">
                {formatINR(product.compare_at_paise!)}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-[#444444] leading-relaxed">{product.description}</p>

        {/* Size Selection */}
        <div className="space-y-3 pt-4 border-t border-[#e5e5e5]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#111111]">Size</span>
            <span className="text-[#666666]">
              {outOfStock ? "Out of stock" : `${product.stock_quantity} in stock`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setIsCustom(false);
                  setSelectedSize(size);
                }}
                className={`min-w-[52px] px-4 py-2.5 text-sm border transition-colors cursor-pointer ${
                  !isCustom && selectedSize === size
                    ? "bg-[#111111] text-white border-[#111111]"
                    : "bg-white text-[#111111] border-[#d4d4d4] hover:border-[#111111]"
                }`}
              >
                {size}
              </button>
            ))}

            {product.allow_custom_tailoring && (
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`px-4 py-2.5 text-sm border transition-colors cursor-pointer ${
                  isCustom
                    ? "bg-[#9b1c1c] text-white border-[#9b1c1c]"
                    : "bg-white text-[#111111] border-[#d4d4d4] hover:border-[#9b1c1c]"
                }`}
              >
                Custom Stitched
              </button>
            )}
          </div>

          {isCustom && (
            <p className="text-xs text-[#555555] bg-[#f7f7f5] p-3.5 border border-[#e5e5e5]">
              You can enter your measurements at checkout, or choose Majnu Ka Tila shop pickup to
              get measured in person.
            </p>
          )}
        </div>

        {/* Quantity & Add to Bag */}
        <div className="flex items-center gap-3 pt-2">
          <div className="inline-flex items-center border border-[#d4d4d4] h-12">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="px-3.5 text-[#444444] hover:text-[#111111] cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() =>
                setQuantity((q) =>
                  Math.min(20, Math.min(Math.max(1, product.stock_quantity), q + 1))
                )
              }
              aria-label="Increase quantity"
              className="px-3.5 text-[#444444] hover:text-[#111111] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex-1 h-12 bg-[#111111] hover:bg-[#9b1c1c] disabled:bg-[#bbbbbb] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {outOfStock ? (
              "Out of Stock"
            ) : added ? (
              <>
                <Check className="w-4 h-4" />
                Added to Bag
              </>
            ) : (
              `Add to Bag — ${formatINR(product.price_paise * quantity)}`
            )}
          </button>
        </div>

        {/* Simple Garment Details */}
        <dl className="pt-4 border-t border-[#e5e5e5] space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[#666666]">Fabric</dt>
            <dd className="text-[#111111] text-right">{product.fabric}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#666666]">Care</dt>
            <dd className="text-[#111111] text-right">{product.care_instructions}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#666666]">Stitching Time</dt>
            <dd className="text-[#111111] text-right">{product.lead_time_days} days</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#666666]">Delivery &amp; Pickup</dt>
            <dd className="text-[#111111] text-right">
              Free over ₹5,000 or free pickup in Majnu Ka Tila
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
