import { getAuthenticatedContext } from "@/lib/supabase/server";
import { CheckoutClient } from "@/components/CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { user, profile } = await getAuthenticatedContext();

  const checkoutUser = user
    ? {
        id: user.id,
        email: user.email ?? "",
        fullName: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e2a2b]">
          Secure Atelier Checkout
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#171412] mt-1">
          Complete Your S.S Tailors Order
        </h1>
      </div>
      <CheckoutClient user={checkoutUser} />
    </div>
  );
}
