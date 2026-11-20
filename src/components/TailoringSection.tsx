"use client";

import { useState } from "react";

const GARMENT_OPTIONS = [
  "Women's Chuba",
  "Men's Chuba",
  "Pangden Apron",
  "Silk Wonju Blouse / Shirt",
  "Brocade Jacket / Vest",
  "Ceremonial / Losar Outfit",
  "Kids' Tibetan Wear",
];

export function TailoringSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [garmentType, setGarmentType] = useState(GARMENT_OPTIONS[0]);
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          garment_type: garmentType,
          preferred_date: preferredDate,
          notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not send request.");
        return;
      }
      setSuccessMsg("Thanks! We received your inquiry and will contact you shortly.");
      setName("");
      setEmail("");
      setPhone("");
      setPreferredDate("");
      setNotes("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="custom-tailoring"
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-20 sm:pt-24"
    >
      <div className="border-t border-[#e5e5e5] pt-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
            Custom Stitching &amp; Fittings
          </h2>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            Want a Chuba, Wonju, or Losar outfit stitched to your exact measurements? Visit our
            tailor shop in Majnu Ka Tila, New Delhi, or leave your details and we will reach out.
          </p>
          <div className="pt-2 text-sm text-[#444444] space-y-1">
            <p className="font-medium text-[#111111]">S.S Tailors</p>
            <p>New Aruna Nagar (Majnu Ka Tila), New Delhi 110054</p>
            <p className="text-[#666666]">Open Tuesday – Sunday, 10:30 AM – 8:00 PM</p>
          </div>
        </div>

        <div className="lg:col-span-7">
          {successMsg ? (
            <div className="p-6 bg-[#f7f7f5] border border-[#e5e5e5] space-y-3">
              <p className="text-sm font-medium text-[#111111]">{successMsg}</p>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="text-sm underline text-[#555555] hover:text-[#111111] cursor-pointer"
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1.5">Name *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98100 00000"
                    className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1.5">
                    Garment *
                  </label>
                  <select
                    value={garmentType}
                    onChange={(e) => setGarmentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#d4d4d4] bg-white text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    {GARMENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#444444] mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Fabric color, event date, or sizing details"
                  className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm text-[#111111] focus:outline-none focus:border-[#111111] resize-none"
                />
              </div>

              {error && <p className="text-sm text-[#9b1c1c]">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-[#111111] hover:bg-[#9b1c1c] disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                {submitting ? "Sending..." : "Request Fitting"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
