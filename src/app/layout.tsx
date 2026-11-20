import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { getAuthenticatedContext } from "@/lib/supabase/server";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "S.S Tailors — Authentic Tibetan Clothing | Majnu Ka Tila, Delhi",
    template: "%s | S.S Tailors",
  },
  description:
    "Authentic Tibetan clothing made in Majnu Ka Tila, New Delhi — Chubas, Pangden aprons, silk Wonjus, brocade jackets, and custom tailoring.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile } = await getAuthenticatedContext();

  const navUser = user
    ? {
        id: user.id,
        email: user.email ?? "",
        fullName: profile?.full_name || user.email?.split("@")[0] || "Account",
        role: profile?.role ?? "customer",
      }
    : null;

  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen flex flex-col bg-white text-[#111111] selection:bg-[#111111] selection:text-white">
        <CartProvider>
          <Navbar user={navUser} />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
