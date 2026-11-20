"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Lock, MapPin, Ruler, ShieldCheck, Truck } from "lucide-react";
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
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#e8e3dc] overflow-hidden shadow-sm">
        <div className="pangden-thread w-full" />
        <div className="p-8 sm:p-12 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#f3f9f5] border border-[#cde6d5] text-[#2b6b4f] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2b6b4f]">
              Order Confirmed by Server
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#171412] mt-2">
              Thank You for Your Order
            </h1>
            <p className="text-sm text-[#6c635b] mt-2">
              Our tailors at Majnu Ka Tila have received your order and locked your inventory.
            </p>
          </div>

          <div className="bg-[#faf9f7] border border-[#ece7df] rounded-2xl p-5 text-left space-y-2 text-sm max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-[#6c635b]">Order Number</span>
              <span className="font-mono font-semibold text-[#171412]">
                {placedOrder.order_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6c635b]">Verified Subtotal</span>
              <span className="font-mono">{formatINR(placedOrder.subtotal_paise)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6c635b]">Shipping</span>
              <span className="font-mono">
                {placedOrder.shipping_paise === 0 ? "Complimentary" : formatINR(placedOrder.shipping_paise)}
              </span>
            </div>
            <div className="pt-2 border-t border-[#e8e3dc] flex justify-between font-semibold">
              <span>Authoritative Total</span>
              <span className="font-mono text-[#9e2a2b]">
                {formatINR(placedOrder.total_paise)}
              </span>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/account"
              className="px-6 py-3 rounded-full bg-[#171412] hover:bg-[#9e2a2b] text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
            >
              View Order History
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-full border border-[#dcd5ca] text-xs font-semibold uppercase tracking-[0.14em] hover:border-[#171412]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-3xl border border-[#e8e3dc] p-10 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-[#faf9f7] border border-[#e8e3dc] flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5 text-[#9e2a2b]" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-[#171412]">
          Sign In to Complete Checkout
        </h1>
        <p className="text-sm text-[#6c635b] leading-relaxed">
          Every order at S.S Tailors is bound to your authenticated account with Row Level Security
          so your measurements, address, and tailoring status stay strictly private.
        </p>
        <Link
          href="/login?next=/checkout"
          className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#171412] hover:bg-[#9e2a2b] text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-3xl border border-[#e8e3dc] p-10 text-center space-y-4">
        <h1 className="font-serif text-3xl font-medium text-[#171412]">Your Bag is Empty</h1>
        <p className="text-sm text-[#6c635b]">
          Add a Tibetan Chuba, Pangden, Wonju, or Brocade Jacket to proceed to checkout.
        </p>
        <Link
          href="/#collection"
          className="inline-flex px-6 py-3 rounded-full bg-[#171412] text-white text-xs font-semibold uppercase tracking-[0.14em]"
        >
          Explore Collection
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
        setError(json.error ?? "Unable to place your order.");
        return;
      }

      setPlacedOrder(json.order);
      clearCart();
    } catch {
      setError("Network error while placing order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left Checkout Form */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-3xl border border-[#e8e3dc] p-6 sm:p-8 space-y-5">
          <h2 className="font-serif text-2xl font-medium text-[#171412]">1. Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
              />
            </div>
          </div>
          <p className="text-xs text-[#7a7067]">
            Signed in as <span className="font-mono text-[#171412]">{user.email}</span>
          </p>
        </div>

        {/* Fulfillment */}
        <div className="bg-white rounded-3xl border border-[#e8e3dc] p-6 sm:p-8 space-y-5">
          <h2 className="font-serif text-2xl font-medium text-[#171412]">
            2. Delivery or Studio Pickup
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                fulfillment === "delivery"
                  ? "border-[#171412] bg-[#faf9f7]"
                  : "border-[#e5dfd6] hover:border-[#b9b0a4]"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#171412]">
                <Truck className="w-4 h-4 text-[#9e2a2b]" />
                Pan-India Insured Courier
              </div>
              <p className="text-xs text-[#6c635b] mt-1">
                Free over ₹5,000 (else ₹250 flat)
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFulfillment("studio_pickup")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                fulfillment === "studio_pickup"
                  ? "border-[#171412] bg-[#faf9f7]"
                  : "border-[#e5dfd6] hover:border-[#b9b0a4]"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#171412]">
                <MapPin className="w-4 h-4 text-[#c8922e]" />
                Majnu Ka Tila Studio Pickup
              </div>
              <p className="text-xs text-[#6c635b] mt-1">
                Complimentary · Includes in-person trial
              </p>
            </button>
          </div>

          {fulfillment === "delivery" ? (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="House / Flat No., Street, Locality"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
                  Landmark / Apartment (Optional)
                </label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1.5">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="110054"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#faf9f7] border border-[#ece7df] text-xs text-[#4b443e]">
              <p className="font-semibold text-[#171412]">S.S Tailors Atelier — Majnu Ka Tila</p>
              <p className="mt-1">
                New Aruna Nagar (Tibetan Colony), Civil Lines, New Delhi 110054. We will notify
                you by phone as soon as your garment is ready for fitting.
              </p>
            </div>
          )}
        </div>

        {/* Custom Tailoring Measurements (when bespoke items in bag) */}
        {hasCustomItems && (
          <div className="bg-white rounded-3xl border border-[#e8e3dc] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#9e2a2b]" />
              <h2 className="font-serif text-2xl font-medium text-[#171412]">
                3. Bespoke Measurements (Inches)
              </h2>
            </div>
            <p className="text-xs text-[#6c635b]">
              Optional if you prefer to be measured in person at Majnu Ka Tila. Leave blank any measurement you want us to confirm by phone.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(
                [
                  ["chestInches", "Chest / Bust"],
                  ["waistInches", "Waist"],
                  ["hipInches", "Hip"],
                  ["shoulderInches", "Shoulder"],
                  ["sleeveInches", "Sleeve Length"],
                  ["lengthInches", "Full Length"],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={measurements[field] ?? ""}
                    onChange={(e) =>
                      setMeasurements((m) => ({ ...m, [field]: e.target.value }))
                    }
                    placeholder='e.g. 38"'
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ddd4] text-sm font-mono focus:outline-none focus:border-[#9e2a2b]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Notes */}
        <div className="bg-white rounded-3xl border border-[#e8e3dc] p-6 sm:p-8 space-y-3">
          <label className="block font-serif text-xl font-medium text-[#171412]">
            Tailoring Notes (Optional)
          </label>
          <textarea
            rows={3}
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special sleeve cuff preference, collar height, or event deadline..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b] resize-none"
          />
        </div>
      </div>

      {/* Right Summary */}
      <aside className="lg:col-span-5 bg-white rounded-3xl border border-[#e8e3dc] p-6 sm:p-8 space-y-5 lg:sticky lg:top-28">
        <h2 className="font-serif text-2xl font-medium text-[#171412]">Order Summary</h2>

        <div className="divide-y divide-[#f0ebe4] max-h-80 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.isCustomTailored}`}
              className="py-3 flex items-center gap-3.5"
            >
              <div className="w-14 h-18 rounded-lg border border-[#eee9e2] bg-white shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#171412] truncate">{item.name}</p>
                <p className="text-[11px] text-[#6c635b]">
                  {item.isCustomTailored ? "Bespoke Custom Fit" : `Size ${item.size}`} × {item.quantity}
                </p>
              </div>
              <span className="font-mono text-sm font-medium text-[#171412]">
                {formatINR(item.pricePaise * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#ece7df] space-y-2.5 text-sm">
          <div className="flex justify-between text-[#5d554d]">
            <span>Subtotal</span>
            <span className="font-mono">{formatINR(subtotalPaise)}</span>
          </div>
          <div className="flex justify-between text-[#5d554d]">
            <span>Shipping</span>
            <span className="font-mono">
              {estimatedShipping === 0 ? "Complimentary" : formatINR(estimatedShipping)}
            </span>
          </div>
          <div className="pt-3 border-t border-[#ece7df] flex justify-between text-base font-semibold text-[#171412]">
            <span>Total (Pay at Studio / COD / UPI on Confirmation)</span>
            <span className="font-mono text-lg">{formatINR(estimatedTotal)}</span>
          </div>
        </div>

        {error && (
          <p className="text-xs text-[#9e2a2b] bg-[#fdf2f2] border border-[#f5d0d0] px-3.5 py-2.5 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-full bg-[#171412] hover:bg-[#9e2a2b] disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer"
        >
          {submitting ? "Validating Stock & Prices..." : "Confirm & Place Order"}
        </button>

        <div className="flex items-start gap-2.5 text-[11px] text-[#7a7067] pt-1">
          <ShieldCheck className="w-4 h-4 text-[#1f3a52] shrink-0 mt-0.5" />
          <span>
            Tamper-proof checkout: Final unit prices, shipping, and stock reservation are
            calculated atomically on our Postgres server.
          </span>
        </div>
      </aside>
    </form>
  );
}
