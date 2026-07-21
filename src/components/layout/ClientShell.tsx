"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/layout/Providers";

const LoadingScreen = dynamic(
  () => import("@/components/layout/LoadingScreen"),
  { ssr: false }
);

const FloatingActions = dynamic(
  () => import("@/components/layout/FloatingActions"),
  { ssr: false }
);

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // Admin pages manage their own layout (sidebar, topbar) —
    // render bare children with no public Navbar/Footer/chrome.
    return <Providers>{children}</Providers>;
  }

  return (
    <Providers>
      <LoadingScreen />
      <Navbar />
      <main className="min-h-screen pb-16 md:pb-0">{children}</main>
      <Footer />
      <FloatingActions />
    </Providers>
  );
}
