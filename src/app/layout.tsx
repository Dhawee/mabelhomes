import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { SITE } from "@/data/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | ${SITE.title}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Premium real estate brokerage and investment consultancy in Nigeria. Helping families, professionals and investors find exceptional properties with trusted guidance.",
  keywords: [
    "real estate",
    "property",
    "Lagos",
    "Nigeria",
    "investment",
    "broker",
    "Mabel Homes",
    "luxury homes",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    title: `${SITE.name} | ${SITE.title}`,
    description:
      "Premium real estate brokerage and investment consultancy in Nigeria.",
    url: `https://${SITE.website}`,
    siteName: SITE.company,
    locale: "en_NG",
    type: "website",
  },
  icons: {
    icon: "/mabel-homes-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
