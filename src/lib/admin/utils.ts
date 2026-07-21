/** Derives the currency symbol from the ISO code. Defaults to ₦ (NGN). */
export function currencySymbol(currency?: string | null): string {
  return currency === "USD" ? "$" : "\u20a6";
}

/**
 * Formats a price or price range using the property currency.
 * Keeps full integer formatting (comma-separated) for the admin portal.
 */
export function formatAdminPrice(
  price: number,
  maxPrice?: number | null,
  currency?: string | null
): string {
  const sym = currencySymbol(currency);
  const min = `${sym}${price.toLocaleString()}`;
  if (maxPrice) {
    return `${min} \u2013 ${sym}${maxPrice.toLocaleString()}`;
  }
  return min;
}
