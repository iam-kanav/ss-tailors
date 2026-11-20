"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/format";
import type { CustomMeasurements } from "@/lib/types";

interface CheckoutUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
}

interface PlacedOrderResult {
  order_id: string;
  order_number: string;
  subtotal_paise: number;
  shipping_paise: number;
  total_paise: number;
  status: string;
}

export function CheckoutClient({ user }: { user: CheckoutUser | null }) {
  const { items, subtotalPaise, clearCart } = useCart();
  const [customerName, setCustomerName] = useState(user?.fullName ?? "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone ?? "");
  const [fulfillment, setFulfillment] = useState<"delivery" | "studio_pickup">("delivery");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("New Delhi");
  const [stateName, setStateName] = useState("Delhi");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [measurements, setMeasurements] = useState<CustomMeasurements>({
    chestInches: "",
    waistInches: "",
    hipInches: "",
    shoulderInches: "",
    sleeveInches: "",
    lengthInches: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderResult | null>(null);

  const hasCustomItems = items.some((i) => i.isCustomTailored);
  const estimatedShipping =
    fulfillment === "studio_pickup" || subtotalPaise >= 500000 ? 0 : 25000;
  const estimatedTotal = subtotalPaise + estimatedShipping;

  if (placedOrder) {
    return (
      <div className="max-w-lg mx-auto border border-[#e5e5e5] bg-white p-8 sm:p-10 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">Order Placed</h1>
          <p className="text-sm text-[#555555] mt-1.5">
            Thank you. We have received your order at S.S Tailors, Majnu Ka Tila.
          </p>
        </div>

        <div className="bg-[#f7f7f5] border border-[#e5e5e5] p-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#666666]">Order Number</span>
            <span className="font-semibold text-[#111111] tabular-nums">
              {placedOrder.order_number}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Subtotal</span>
            <span className="tabular-nums">{formatINR(placedOrder.subtotal_paise)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Shipping</span>
            <span className="tabular-nums">
              {placedOrder.shipping_paise === 0 ? "Free" : formatINR(placedOrder.shipping_paise)}
            </span>
          </div>
          <div className="pt-2 border-t border-[#e5e5e5] flex justify-between font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatINR(placedOrder.total_paise)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/account"
            className="px-6 py-2.5 bg-[#111111] text-white text-sm font-medium hover:bg-[#9b1c1c] transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 border border-[#d4d4d4] text-sm font-medium text-[#111111] hover:border-[#111111]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto border border-[#e5e5e5] bg-white p-8 sm:p-10 space-y-4">
        <h1 className="text-xl font-semibold text-[#111111]">Sign in to checkout</h1>
        <p className="text-sm text-[#555555]">
          Please sign in or create an account to place your order and track stitching updates.
        </p>
        <Link
          href="/login?next=/checkout"
          className="inline-block px-6 py-2.5 bg-[#111111] hover:bg-[#9b1c1c] text-white text-sm font-medium transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto border border-[#e5e5e5] bg-white p-8 sm:p-10 space-y-4">
        <h1 className="text-xl font-semibold text-[#111111]">Your bag is empty</h1>
        <Link
          href="/#shop"
          className="inline-block px-6 py-2.5 bg-[#111111] text-white text-sm font-medium"
        >
          Shop Clothing
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          fulfillment_method: fulfillment,
          shipping_address:
            fulfillment === "delivery"
              ? { line1, line2, city, state: stateName, postalCode }
              : {},
          custom_measurements: hasCustomItems ? measurements : {},
          notes,
          items: items.map((item) => ({
            product_id: item.productId,
            size: item.size,
            quantity: item.quantity,
            is_custom_tailored: item.isCustomTailored,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Unable to place order.");
        return;
      }

      setPlacedOrder(json.order);
      clearCart();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1.5">
                Phone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                minLength={7}
                maxLength={24}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98100 00000"
                className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>
          <p className="text-xs text-[#666666]">Signed in as {user.email}</p>
        </div>

        <div className="space-y-4 pt-6 border-t border-[#e5e5e5]">
          <h2 className="text-base font-semibold text-[#111111]">Delivery or Pickup</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`p-4 border text-left transition-colors cursor-pointer ${
                fulfillment === "delivery"
                  ? "border-[#111111] bg-[#f7f7f5]"
                  : "border-[#d4d4d4] hover:border-[#888888]"
              }`}
            >
              <p className="text-sm font-medium text-[#111111]">Home Delivery</p>
              <p className="text-xs text-[#666666] mt-0.5">Free over ₹5,000, else ₹250</p>
            </button>

            <button
              type="button"
              onClick={() => setFulfillment("studio_pickup")}
              className={`p-4 border text-left transition-colors cursor-pointer ${
                fulfillment === "studio_pickup"
                  ? "border-[#111111] bg-[#f7f7f5]"
                  : "border-[#d4d4d4] hover:border-[#888888]"
              }`}
            >
              <p className="text-sm font-medium text-[#111111]">Shop Pickup (Majnu Ka Tila)</p>
              <p className="text-xs text-[#666666] mt-0.5">Free · Try it on at our shop</p>
            </button>
          </div>

          {fulfillment === "delivery" ? (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1.5">Address *</label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="House / Flat No., Street, Locality"
                  className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1.5">
                  Landmark (optional)
                </label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="110054"
                    className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#555555] bg-[#f7f7f5] p-4 border border-[#e5e5e5]">
              Pickup at S.S Tailors, New Aruna Nagar (Majnu Ka Tila), New Delhi 110054. We will
              call you when your order is ready.
            </p>
          )}
        </div>

        {hasCustomItems && (
          <div className="space-y-4 pt-6 border-t border-[#e5e5e5]">
            <h2 className="text-base font-semibold text-[#111111]">
              Custom Measurements (inches, optional)
            </h2>
            <p className="text-xs text-[#666666]">
              Leave blank if you want us to take your measurements in person or confirm by phone.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(
                [
                  ["chestInches", "Chest / Bust"],
                  ["waistInches", "Waist"],
                  ["hipInches", "Hip"],
                  ["shoulderInches", "Shoulder"],
                  ["sleeveInches", "Sleeve"],
                  ["lengthInches", "Length"],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-[#444444] mb-1">{label}</label>
                  <input
                    type="text"
                    maxLength={24}
                    value={measurements[field] ?? ""}
                    onChange={(e) =>
                      setMeasurements((m) => ({ ...m, [field]: e.target.value }))
                    }
                    placeholder='e.g. 38"'
                    className="w-full px-3 py-2 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-6 border-t border-[#e5e5e5]">
          <label className="block text-sm font-medium text-[#111111]">Notes (optional)</label>
          <textarea
            rows={3}
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any fitting instructions or preferred date"
            className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111] resize-none"
          />
        </div>
      </div>

      {/* Order Summary */}
      <aside className="lg:col-span-5 bg-[#f7f7f5] border border-[#e5e5e5] p-6 sm:p-8 space-y-5 lg:sticky lg:top-24">
        <h2 className="text-base font-semibold text-[#111111]">Order Summary</h2>

        <div className="divide-y divide-[#e5e5e5]">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.isCustomTailored}`}
              className="py-3 flex items-center gap-3.5"
            >
              <div className="w-14 aspect-[3/4] bg-white shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#111111] truncate">{item.name}</p>
                <p className="text-xs text-[#666666]">
                  {item.isCustomTailored ? "Custom Stitched" : `Size ${item.size}`} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium tabular-nums text-[#111111]">
                {formatINR(item.pricePaise * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#e5e5e5] space-y-2 text-sm">
          <div className="flex justify-between text-[#555555]">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatINR(subtotalPaise)}</span>
          </div>
          <div className="flex justify-between text-[#555555]">
            <span>Delivery</span>
            <span className="tabular-nums">
              {estimatedShipping === 0 ? "Free" : formatINR(estimatedShipping)}
            </span>
          </div>
          <div className="pt-3 border-t border-[#e5e5e5] flex justify-between text-base font-semibold text-[#111111]">
            <span>Total</span>
            <span className="tabular-nums">{formatINR(estimatedTotal)}</span>
          </div>
        </div>

        <p className="text-xs text-[#666666]">
          Pay via UPI, Cash on Delivery, or directly at our Majnu Ka Tila shop.
        </p>

        {error && <p className="text-sm text-[#9b1c1c]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 bg-[#111111] hover:bg-[#9b1c1c] disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </aside>
    </form>
  );
}
