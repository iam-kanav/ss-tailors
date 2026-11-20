import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { getAuthenticatedContext } from "@/lib/supabase/server";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "S.S Tailors — Authentic Tibetan Clothing | Majnu Ka Tila, Delhi",
    template: "%s · S.S Tailors",
  },
  description:
    "Bespoke and ready-to-wear Tibetan Chubas, handwoven Pangden aprons, mulberry silk Wonjus, brocade jackets, and ceremonial Losar attire crafted in Majnu Ka Tila, New Delhi.",
  keywords: [
    "S.S Tailors",
    "Tibetan clothing Delhi",
    "Majnu Ka Tila tailor",
    "Tibetan Chuba",
    "Pangden apron",
    "Wonju blouse",
    "Losar traditional wear",
  ],
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
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#faf9f7] text-[#171412] selection:bg-[#9e2a2b]/15 selection:text-[#171412]">
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
