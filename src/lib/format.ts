export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

export function formatDateIST(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function normalizeSku(input: string): string {
  return input
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9-]+/g, "")
    .slice(0, 40);
}

export const ORDER_STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Pending Review", tone: "bg-amber-50 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmed", tone: "bg-sky-50 text-sky-800 border-sky-200" },
  tailoring: { label: "In Tailoring", tone: "bg-purple-50 text-purple-800 border-purple-200" },
  ready: { label: "Ready for Pickup", tone: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  shipped: { label: "Dispatched", tone: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  delivered: { label: "Delivered", tone: "bg-stone-100 text-stone-700 border-stone-200" },
  cancelled: { label: "Cancelled", tone: "bg-rose-50 text-rose-800 border-rose-200" },
};
