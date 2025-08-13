/**
 * Converts a string to a number, handling common currency and number formats.
 * Legal formats:
 *   - Optional leading minus for negatives (e.g., -1234)
 *   - Optional leading $ (e.g., $1,234.56)
 *   - Commas as digit separators (e.g., 1,234)
 *   - Period for decimal/cents (e.g., 1234.56)
 *   - Spaces are ignored
 *   - Only $ is allowed as a currency symbol
 * Returns undefined if the string cannot be parsed as a number.
 */
export const parseCurrency = (str: string): number | undefined => {
  const trimmed = str.trim();

  // Regex for valid currency formats:
  // ^-? : optional minus at start
  // \$? : optional dollar sign
  // (\d{1,3}(,\d{3})*|\d+) : either comma-separated groups or plain digits
  // (\.\d{1,2})? : optional decimal with 1-2 digits
  // $ : end of string
  const currencyRegex = /^-?\$?(\d{1,3}(,\d{3})*|\d+)(\.\d{1,2})?$/;

  if (!currencyRegex.test(trimmed)) return undefined;
  const withoutSymbols = trimmed.replace(/[$,]/g, "");
  const num = parseFloat(withoutSymbols);
  return isFinite(num) ? num : undefined;
};

/**
 * Fuzzy match two amounts using a tolerance percentage.
 *
 * @param params.searchWithin - The string representing the amount to check (e.g., from a donation record).
 * @param params.searchFor - The string representing the amount the user is searching for.
 * @param params.tolerancePercent - The allowed percent difference (e.g., 10 for ±10%).
 * @returns A score between 0 (perfect match) and 1 (no match). If not a valid number, returns 1.
 */
export function fuzzyAmountMatch(params: {
  searchWithin: string;
  searchFor: string;
  tolerancePercent: number;
}): number {
  const within = parseCurrency(params.searchWithin);
  const target = parseCurrency(params.searchFor);
  if (within === undefined || target === undefined) return 1;
  const diff = Math.abs(within - target);
  const tolerance = (params.tolerancePercent / 100) * Math.abs(target);
  if (diff > tolerance) return 1;
  return diff / tolerance;
}

export const formatUSD = (
  amount: number,
  pennies: "showPennies" | "hidePennies" = "showPennies",
): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: pennies === "hidePennies" ? 0 : 2,
  }).format(amount);
