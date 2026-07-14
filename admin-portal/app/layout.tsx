import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    template: "%s | Mabel Homes Admin",
    default: "Mabel Homes Admin Portal",
  },
  description: "Mabel Homes Client Administration Portal — Manage properties, enquiries, media, and settings.",
  robots: "noindex, nofollow", // Admin portal should not be indexed
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
