"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Ruler, Scissors, Sparkles } from "lucide-react";

const GARMENT_OPTIONS = [
  "Women's Custom Chuba",
  "Men's Custom Chuba (Phogoe)",
  "Losar / Wedding Ceremonial Ensemble",
  "Handwoven Pangden Apron Fitting",
  "Mulberry Silk Wonju Blouse / Shirt",
  "Brocade Toethung Jacket / Vest",
  "Children's Festive Tibetan Set",
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
        setError(json.error ?? "Unable to submit request.");
        return;
      }
      setSuccessMsg(json.message ?? "Your fitting appointment request has been received.");
      setName("");
      setEmail("");
      setPhone("");
      setPreferredDate("");
      setNotes("");
    } catch {
      setError("Network error while sending your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="bespoke" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
      <div className="bg-white rounded-3xl border border-[#e8e3dc] overflow-hidden shadow-[0_24px_60px_-30px_rgba(23,20,18,0.14)]">
        <div className="pangden-thread w-full" aria-hidden="true" />
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Narrative */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 bg-[#faf9f7] border-b lg:border-b-0 lg:border-r border-[#ece7df] flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e2a2b]">
                Bespoke Majnu Ka Tila Tailoring
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#171412] mt-3 leading-tight">
                Cut by Hand in New Aruna Nagar, Tailored to Your Posture
              </h2>
              <p className="mt-4 text-sm text-[#5d554d] leading-relaxed">
                A true Tibetan Chuba hangs with poise when the shoulder slope, sleeve cuff,
                and wrap proportion are drafted for the wearer. Visit S.S Tailors in Majnu Ka Tila,
                Delhi for personal fabric consultation—or book a bespoke fitting slot below.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#e6e0d7] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#c8922e]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#171412]">
                      1. Curated Highland &amp; Brocade Textiles
                    </h3>
                    <p className="text-xs text-[#6c635b] mt-1 leading-relaxed">
                      Choose from dense pulu wool, Varanasi silk kinkhab, breathable summer crepes, and pure mulberry silk for Wonjus.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#e6e0d7] flex items-center justify-center shrink-0">
                    <Ruler className="w-4 h-4 text-[#9e2a2b]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#171412]">
                      2. Master Measurement &amp; Pattern Drafting
                    </h3>
                    <p className="text-xs text-[#6c635b] mt-1 leading-relaxed">
                      In-person fittings in Majnu Ka Tila or guided remote measurements for clients ordering across India and abroad.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#e6e0d7] flex items-center justify-center shrink-0">
                    <Scissors className="w-4 h-4 text-[#1f3a52]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#171412]">
                      3. Hand-Finished Frog Closures &amp; Brocade Piping
                    </h3>
                    <p className="text-xs text-[#6c635b] mt-1 leading-relaxed">
                      Each seam, brocade hem, and silk knot is pressed and inspected prior to studio pickup or insured courier dispatch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#e8e3dc] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#6c635b]">
              <span>New Aruna Nagar, Majnu Ka Tila, Delhi 110054</span>
              <span className="text-[#c8922e]">●</span>
              <span>Losar &amp; Bridal Rush Orders Available</span>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14">
            <h3 className="font-serif text-2xl font-medium text-[#171412]">
              Book a Studio Fitting or Custom Commission
            </h3>
            <p className="text-xs text-[#6c635b] mt-1">
              Tell us the garment you have in mind. Our master tailor will confirm your fitting slot.
            </p>

            {successMsg ? (
              <div className="mt-8 p-6 rounded-2xl bg-[#f3f9f5] border border-[#cde6d5] text-[#1f5139] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Request Confirmed
                </div>
                <p className="text-xs leading-relaxed">{successMsg}</p>
                <button
                  type="button"
                  onClick={() => setSuccessMsg(null)}
                  className="mt-2 text-xs font-semibold underline cursor-pointer"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tenzin Dolma"
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98100 00000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
                      Preferred Studio Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#8c8278] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
                    Garment Type *
                  </label>
                  <select
                    value={garmentType}
                    onChange={(e) => setGarmentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] bg-white text-sm focus:outline-none focus:border-[#9e2a2b]"
                  >
                    {GARMENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
                    Fabric Preferences, Occasion, or Notes
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1500}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Losar wedding ceremony in February, looking for deep indigo silk brocade with matching Wonju..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b] resize-none"
                  />
                </div>

                {error && (
                  <p className="text-xs text-[#9e2a2b] bg-[#fdf2f2] border border-[#f5d0d0] px-3.5 py-2.5 rounded-xl">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-full bg-[#171412] hover:bg-[#9e2a2b] disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer"
                >
                  {submitting ? "Sending Request..." : "Request Atelier Appointment"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
