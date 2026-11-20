import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShieldCheck, Sparkles } from "lucide-react";
import { getAuthenticatedContext } from "@/lib/supabase/server";
import { formatDateIST, formatINR, ORDER_STATUS_LABELS } from "@/lib/format";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { supabase, user, profile } = await getAuthenticatedContext();

  if (!user) {
    redirect("/login?next=/account");
  }

  const { data: ordersData } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const orders = (ordersData ?? []) as Order[];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#e8e3dc]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e2a2b]">
            Client Portal
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#171412] mt-1">
            {profile?.full_name || "Your S.S Tailors Account"}
          </h1>
          <p className="text-sm text-[#6c635b] mt-1">{user.email}</p>
        </div>

        <div className="flex items-center gap-3">
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#9e2a2b] text-white text-xs font-semibold uppercase tracking-[0.12em]"
            >
              <ShieldCheck className="w-4 h-4" />
              Open Admin Atelier
            </Link>
          )}
          <Link
            href="/#collection"
            className="px-5 py-2.5 rounded-full border border-[#dcd5ca] text-xs font-semibold uppercase tracking-[0.12em] hover:border-[#171412]"
          >
            Shop Collection
          </Link>
        </div>
      </div>

      {/* Orders List */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-medium text-[#171412]">Your Orders</h2>
          <span className="text-xs font-mono text-[#7a7067]">{orders.length} total</span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#ece7df] p-12 text-center space-y-3">
            <Package className="w-8 h-8 text-[#a3988c] mx-auto" />
            <p className="font-serif text-2xl text-[#171412]">No orders placed yet</p>
            <p className="text-xs text-[#6c635b]">
              Explore our Tibetan Chubas, handwoven Pangdens, and mulberry silk Wonjus.
            </p>
            <div className="pt-2">
              <Link
                href="/#collection"
                className="inline-flex px-6 py-2.5 rounded-full bg-[#171412] text-white text-xs font-semibold uppercase tracking-[0.12em]"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const badge = ORDER_STATUS_LABELS[order.status] ?? {
                label: order.status,
                tone: "bg-stone-100 text-stone-700 border-stone-200",
              };
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#ece7df] overflow-hidden"
                >
                  <div className="px-6 py-4 bg-[#faf9f7] border-b border-[#eee9e2] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <span className="font-mono font-semibold text-[#171412]">
                        {order.order_number}
                      </span>
                      <span className="text-[#6c635b]">{formatDateIST(order.created_at)}</span>
                      <span className="text-[#6c635b] capitalize">
                        {order.fulfillment_method === "studio_pickup"
                          ? "Majnu Ka Tila Pickup"
                          : "Courier Delivery"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full border text-[11px] font-medium ${badge.tone}`}
                      >
                        {badge.label}
                      </span>
                      <span className="font-mono text-sm font-semibold text-[#171412]">
                        {formatINR(order.total_paise)}
                      </span>
                    </div>
                  </div>

                  <div className="px-6 py-4 divide-y divide-[#f3efe9]">
                    {(order.order_items ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between gap-4 text-sm"
                      >
                        <div>
                          <p className="font-medium text-[#171412]">{item.product_name}</p>
                          <p className="text-xs text-[#6c635b] flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono">{item.product_sku}</span>
                            <span>·</span>
                            {item.is_custom_tailored ? (
                              <span className="inline-flex items-center gap-1 text-[#9e2a2b]">
                                <Sparkles className="w-3 h-3" />
                                Bespoke Custom Fit
                              </span>
                            ) : (
                              <span>Size {item.size}</span>
                            )}
                            <span>× {item.quantity}</span>
                          </p>
                        </div>
                        <span className="font-mono text-sm text-[#171412]">
                          {formatINR(item.line_total_paise)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
