"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 500000; // ₹5,000 in paise

export function CartDrawer() {
  const { items, isOpen, subtotalPaise, closeCart, updateQuantity, removeItem } = useCart();

  if (!isOpen) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalPaise);
  const progressPct = Math.min(100, Math.round((subtotalPaise / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Bag">
      <div
        className="fixed inset-0 bg-[#171412]/40 backdrop-blur-[2px] transition-opacity"
        onClick={closeCart}
      />

      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#e8e3dc]">
        <div className="px-6 py-5 border-b border-[#eee9e2] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#171412]">Your Bag</h2>
            <p className="text-xs text-[#6c635b] mt-0.5">
              Prices &amp; inventory verified securely at checkout
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="p-2 rounded-full hover:bg-[#f4f1ec] text-[#4b443e] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="px-6 py-3 bg-[#faf9f7] border-b border-[#eee9e2]">
            <p className="text-xs text-[#4b443e] mb-1.5">
              {remainingForFreeShipping === 0 ? (
                <span className="text-[#2b6b4f] font-medium">
                  Complimentary insured Pan-India delivery unlocked.
                </span>
              ) : (
                <>
                  Add <span className="font-semibold text-[#171412]">{formatINR(remainingForFreeShipping)}</span> more for free insured shipping (or select free Majnu Ka Tila pickup).
                </>
              )}
            </p>
            <div className="w-full h-1 bg-[#e8e3dc] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#9e2a2b] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Line items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#f0ebe4]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-full bg-[#faf9f7] border border-[#e8e3dc] flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-[#8e847a]" />
              </div>
              <p className="font-serif text-xl text-[#171412]">Your bag is empty</p>
              <p className="text-xs text-[#6c635b] mt-1.5 max-w-[240px]">
                Explore hand-tailored Tibetan Chubas, woven Pangdens, and pure mulberry silk Wonjus.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-6 px-5 py-2.5 rounded-full bg-[#171412] text-white text-xs font-medium tracking-wide hover:bg-[#9e2a2b] transition-colors cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.isCustomTailored}`}
                className="py-4 flex gap-4"
              >
                <Link
                  href={`/products/${item.slug}`}
                  onClick={closeCart}
                  className="w-20 h-26 shrink-0 bg-white border border-[#eee9e2] rounded-lg overflow-hidden flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain p-1"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-[#171412] hover:text-[#9e2a2b] line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.productId, item.size, item.isCustomTailored)
                      }
                      aria-label={`Remove ${item.name}`}
                      className="text-[#8e847a] hover:text-[#9e2a2b] p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[#6c635b]">
                    <span className="font-mono uppercase">{item.sku}</span>
                    <span>·</span>
                    {item.isCustomTailored ? (
                      <span className="inline-flex items-center gap-1 text-[#9e2a2b] font-medium">
                        <Sparkles className="w-3 h-3" />
                        Bespoke Custom Fit
                      </span>
                    ) : (
                      <span>Size: {item.size}</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border border-[#e5dfd6] rounded-full">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.isCustomTailored, -1)
                        }
                        aria-label="Decrease quantity"
                        className="px-2.5 py-1 text-[#4b443e] hover:text-[#171412] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.isCustomTailored, 1)
                        }
                        aria-label="Increase quantity"
                        className="px-2.5 py-1 text-[#4b443e] hover:text-[#171412] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-sm font-medium font-mono text-[#171412]">
                      {formatINR(item.pricePaise * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#e8e3dc] px-6 py-5 bg-[#faf9f7] space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6c635b]">Estimated Subtotal</span>
              <span className="font-mono text-lg font-semibold text-[#171412]">
                {formatINR(subtotalPaise)}
              </span>
            </div>
            <p className="text-[11px] text-[#7a7067]">
              Complimentary bespoke tailoring included. Pickup free at our Majnu Ka Tila studio.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#171412] text-white text-xs font-semibold uppercase tracking-[0.12em] hover:bg-[#9e2a2b] transition-colors"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
