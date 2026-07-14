import { fileURLToPath } from "url";
import { dirname } from "path";
import type { NextConfig } from "next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "**", // Allow all HTTPS domains for production (Supabase, Cloudflare, etc.)
      },
    ],
  },
};

export default nextConfig;
