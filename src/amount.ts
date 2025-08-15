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
 * Calculates how close a number is to a particular target.
 *
 * @param value - The first number to compare.
 * @param target - The target number to compare against.
 * @param tolerancePercent - The allowed percent difference (e.g., 10 for ±10%).
 * @returns A score between 0 (perfect match) and 1 (no match). Returns 1 if numbers are too far apart.
 */
export const closeness = (params: {
  value: number;
  target: number;
  tolerancePercent: number;
}): number => {
  const { value, target, tolerancePercent } = params;
  const diff = Math.abs(value - target);
  const tolerance = (tolerancePercent / 100) * Math.abs(target);
  if (diff > tolerance) return 1;
  return diff / tolerance;
};

/**
 * Checks if a value is within a specified percentage tolerance of a target.
 * 
 * @param target - The target amount to compare against.
 * @param value - The value to check.
 * @param tolerancePercent - The allowed percent difference (e.g., 10 for ±10%).
 * @returns true if the value is within tolerance, false otherwise.
 */
export const isAmountWithinTolerancePercent = (params: {
  target: number;
  value: number;
  tolerancePercent: number;
}): boolean => {
  const { value, target, tolerancePercent } = params;
  const diff = Math.abs(value - target);
  const tolerance = (tolerancePercent / 100) * Math.abs(target);
  return diff <= tolerance;
};

// Converts a number to USD currency format like $1,234.56
export const formatUSD = (
  amount: number,
  pennies: "showPennies" | "hidePennies" = "showPennies",
): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: pennies === "hidePennies" ? 0 : 2,
  }).format(amount);
