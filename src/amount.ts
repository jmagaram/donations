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
  // Remove leading/trailing whitespace
  const trimmed = str.trim();

  // Check for empty string
  if (trimmed === "") return undefined;

  // Check for invalid characters (anything other than digits, $, comma, period, minus, spaces)
  if (!/^[-$\d,.\s]+$/.test(trimmed)) return undefined;

  // Check for multiple currency symbols
  const dollarCount = (trimmed.match(/\$/g) || []).length;
  if (dollarCount > 1) return undefined;

  // Remove spaces and currency symbol
  const withoutSpacesAndDollar = trimmed.replace(/[\s$]/g, "");

  // Check for multiple decimal points
  const decimalCount = (withoutSpacesAndDollar.match(/\./g) || []).length;
  if (decimalCount > 1) return undefined;

  // Check for invalid comma placement (commas should only be in groups of 3 digits)
  // Split by decimal point to handle integer and fractional parts separately
  const parts = withoutSpacesAndDollar.split(".");
  const integerPart = parts[0];

  // Remove commas and check if the result matches expected comma pattern
  const withoutCommas = integerPart.replace(/,/g, "");

  // If there are commas, validate they're in the right places
  if (integerPart.includes(",")) {
    // Build expected format with commas
    const reversed = withoutCommas.split("").reverse().join("");
    const withExpectedCommas = reversed
      .replace(/(\d{3})/g, "$1,")
      .split("")
      .reverse()
      .join("");
    const expectedFormat = withExpectedCommas.startsWith(",")
      ? withExpectedCommas.slice(1)
      : withExpectedCommas;

    if (integerPart !== expectedFormat) return undefined;
  }

  // Remove commas and parse
  const cleaned = withoutSpacesAndDollar.replace(/,/g, "");
  const num = parseFloat(cleaned);

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
  pennies: "showPennies" | "hidePennies" = "showPennies"
): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: pennies === "hidePennies" ? 0 : 2,
  }).format(amount);
