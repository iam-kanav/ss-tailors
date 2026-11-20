import Link from "next/link";
import { redirect } from "next/navigation";
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

  if (!profile || profile.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-xl font-semibold text-[#111111]">Admin access required</h1>
        <p className="text-sm text-[#666666]">
          Your account ({user.email}) does not have admin access for S.S Tailors.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-[#111111] text-white text-sm font-medium"
        >
          Back to Store
        </Link>
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
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
