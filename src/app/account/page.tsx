import Link from "next/link";
import { redirect } from "next/navigation";
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111]">
            {profile?.full_name || "My Account"}
          </h1>
          <p className="text-sm text-[#666666] mt-1">{user.email}</p>
        </div>

        <div className="flex items-center gap-3">
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#9b1c1c] text-white text-sm font-medium"
            >
              Admin Panel
            </Link>
          )}
          <Link
            href="/#shop"
            className="px-4 py-2 border border-[#d4d4d4] text-sm font-medium text-[#111111] hover:border-[#111111]"
          >
            Shop Clothing
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#111111]">Orders ({orders.length})</h2>

        {orders.length === 0 ? (
          <div className="border border-[#e5e5e5] p-10 text-center space-y-3">
            <p className="text-sm text-[#555555]">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/#shop"
              className="inline-block px-5 py-2.5 bg-[#111111] text-white text-sm font-medium"
            >
              Browse Clothing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const badge = ORDER_STATUS_LABELS[order.status] ?? {
                label: order.status,
                tone: "bg-neutral-100 text-neutral-700 border-neutral-200",
              };
              return (
                <div key={order.id} className="border border-[#e5e5e5] bg-white">
                  <div className="px-5 py-3.5 bg-[#f7f7f5] border-b border-[#e5e5e5] flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-[#111111] tabular-nums">
                        {order.order_number}
                      </span>
                      <span className="text-xs text-[#666666]">{formatDateIST(order.created_at)}</span>
                      <span className="text-xs text-[#666666]">
                        {order.fulfillment_method === "studio_pickup"
                          ? "Majnu Ka Tila Pickup"
                          : "Delivery"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 border text-xs ${badge.tone}`}>
                        {badge.label}
                      </span>
                      <span className="font-semibold tabular-nums text-[#111111]">
                        {formatINR(order.total_paise)}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-3 divide-y divide-[#eeeeee]">
                    {(order.order_items ?? []).map((item) => (
                      <div key={item.id} className="py-2.5 flex justify-between gap-4 text-sm">
                        <div>
                          <p className="text-[#111111]">{item.product_name}</p>
                          <p className="text-xs text-[#666666]">
                            {item.is_custom_tailored ? "Custom Stitched" : `Size ${item.size}`} ×{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <span className="tabular-nums text-[#111111]">
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
