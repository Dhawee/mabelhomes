import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Derives the currency symbol from the ISO code. Defaults to ₦ (NGN). */
export function currencySymbol(currency?: string | null): string {
  return currency === "USD" ? "$" : "\u20a6";
}

/**
 * Formats a price (or price range) as a human-readable shorthand string.
 * Supports up to 2 decimal places, stripping trailing zeros.
 * Examples (NGN): 2400000 → ₦2.4M | 1250000 → ₦1.25M | 850000 → ₦850K
 * Examples (USD): 2400000 → $2.4M
 *
 * If maxPrice is provided, returns a range: ₦1.25M – ₦1.5M
 * The currency parameter ("NGN" | "USD") controls the symbol; defaults to NGN.
 */
export function formatPrice(
  price: number,
  maxPrice?: number | null,
  currency?: string | null
): string {
  const sym = currencySymbol(currency);
  const formattedMin = formatSinglePrice(price, sym);
  if (maxPrice !== undefined && maxPrice !== null) {
    const formattedMax = formatSinglePrice(maxPrice, sym);
    return `${formattedMin} \u2013 ${formattedMax}`;
  }
  return formattedMin;
}

/**
 * Alias for formatPrice — used on property detail pages.
 */
export function formatPriceFull(
  price: number,
  maxPrice?: number | null,
  currency?: string | null
): string {
  return formatPrice(price, maxPrice, currency);
}

function formatSinglePrice(price: number, symbol: string): string {
  if (price >= 1_000_000_000) {
    const val = price / 1_000_000_000;
    return `${symbol}${parseFloat(val.toFixed(2))}B`;
  }
  if (price >= 1_000_000) {
    const val = price / 1_000_000;
    return `${symbol}${parseFloat(val.toFixed(2))}M`;
  }
  if (price >= 1_000) {
    const val = price / 1_000;
    return `${symbol}${parseFloat(val.toFixed(2))}K`;
  }
  return `${symbol}${parseFloat(price.toFixed(2))}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
