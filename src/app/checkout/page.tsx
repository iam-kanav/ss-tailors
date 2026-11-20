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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#111111] mb-8">Checkout</h1>
      <CheckoutClient user={checkoutUser} />
    </div>
  );
}
