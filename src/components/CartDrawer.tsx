"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, subtotalPaise, closeCart, updateQuantity, removeItem } = useCart();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div className="fixed inset-0 bg-black/30" onClick={closeCart} />

      <aside className="relative w-full max-w-[420px] bg-white h-full flex flex-col border-l border-[#e5e5e5]">
        <div className="px-6 h-16 border-b border-[#e5e5e5] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#111111]">
            Bag ({items.reduce((sum, i) => sum + i.quantity, 0)})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="p-1 text-[#555555] hover:text-[#111111] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 divide-y divide-[#eeeeee]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <p className="text-base font-medium text-[#111111]">Your bag is empty</p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-5 px-6 py-2.5 bg-[#111111] text-white text-sm font-medium hover:bg-[#333333] transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.isCustomTailored}`}
                className="py-5 flex gap-4"
              >
                <Link
                  href={`/products/${item.slug}`}
                  onClick={closeCart}
                  className="w-20 aspect-[3/4] shrink-0 bg-[#f5f5f3] overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-[#111111] hover:underline leading-snug"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.productId, item.size, item.isCustomTailored)
                      }
                      className="text-xs text-[#777777] hover:text-[#111111] cursor-pointer shrink-0"
                    >
                      Remove
                    </button>
                  </div>

                  <p className="text-xs text-[#666666] mt-1">
                    {item.isCustomTailored ? "Custom Tailored" : `Size: ${item.size}`}
                  </p>

                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border border-[#dddddd]">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.isCustomTailored, -1)
                        }
                        aria-label="Decrease quantity"
                        className="px-2.5 py-1 text-[#444444] hover:text-[#111111] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.isCustomTailored, 1)
                        }
                        aria-label="Increase quantity"
                        className="px-2.5 py-1 text-[#444444] hover:text-[#111111] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-medium tabular-nums text-[#111111]">
                      {formatINR(item.pricePaise * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#e5e5e5] px-6 py-5 bg-white space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#555555]">Subtotal</span>
              <span className="font-semibold tabular-nums text-[#111111]">
                {formatINR(subtotalPaise)}
              </span>
            </div>
            <p className="text-xs text-[#777777]">
              Free delivery over ₹5,000, or free pickup at our Majnu Ka Tila shop.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center py-3 px-6 bg-[#111111] hover:bg-[#9b1c1c] text-white text-sm font-medium transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
