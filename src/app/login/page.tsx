import { redirect } from "next/navigation";
import { getAuthenticatedContext } from "@/lib/supabase/server";
import { AuthForm } from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const { user, profile } = await getAuthenticatedContext();

  if (user) {
    if (profile?.role === "admin" && (!params.next || params.next === "/")) {
      redirect("/admin");
    }
    redirect(params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/account");
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-14">
      <AuthForm nextPath={params.next} />
    </div>
  );
}
