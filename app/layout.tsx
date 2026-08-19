import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Footer, Header, MobileTabBar } from "@/components/SiteChrome";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Meridian — Global houses hiring in India",
    template: "%s · Meridian",
  },
  description:
    "A private board of live roles from international companies hiring in India — Stripe, NVIDIA, OpenAI, Databricks, and more.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#14110F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-app font-sans text-text pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="pointer-events-none fixed left-[18px] top-0 hidden h-full w-px bg-gold/25 lg:block" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileTabBar />
      </body>
    </html>
  );
}
