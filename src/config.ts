const isServer = typeof window === "undefined";
export const API_BASE_URL =
  (isServer ? process.env.API_URL : null) ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

