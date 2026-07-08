import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    return `₦${(price / 1_000_000_000).toFixed(1)}B`;
  }
  if (price >= 1_000_000) {
    return `₦${(price / 1_000_000).toFixed(0)}M`;
  }
  return `₦${price.toLocaleString()}`;
}

export function formatPriceFull(price: number): string {
  return `₦${price.toLocaleString()}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
