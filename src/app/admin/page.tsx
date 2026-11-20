import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getAuthenticatedContext } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/AdminDashboard";
import type {
  AuditLog,
  Category,
  Order,
  ProductWithCategory,
  TailoringInquiry,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { supabase, user, profile } = await getAuthenticatedContext();

  if (!user) {
    redirect("/login?next=/admin");
  }

  // Strict server-side RBAC verification against Postgres profiles table
  if (!profile || profile.role !== "admin") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl border border-[#e8e3dc] p-10 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#fdf2f2] text-[#9e2a2b] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-[#171412]">
            Administrator Access Required
          </h1>
          <p className="text-sm text-[#6c635b] leading-relaxed">
            Your account (<span className="font-mono text-[#171412]">{user.email}</span>) does
            not hold administrator permissions for S.S Tailors. Role escalation is locked at the
            database level.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex px-6 py-3 rounded-full bg-[#171412] text-white text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [
    { data: products },
    { data: categories },
    { data: orders },
    { data: inquiries },
    { data: auditLogs },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(id, slug, name, tibetan_name)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("tailoring_inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <AdminDashboard
        adminEmail={user.email ?? ""}
        initialProducts={(products ?? []) as ProductWithCategory[]}
        initialCategories={(categories ?? []) as Category[]}
        initialOrders={(orders ?? []) as Order[]}
        initialInquiries={(inquiries ?? []) as TailoringInquiry[]}
        initialAuditLogs={(auditLogs ?? []) as AuditLog[]}
      />
    </div>
  );
}
