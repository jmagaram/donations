/**
 * Fuzzy match two date strings for search purposes.
 *
 * @param searchWithin - The date string from the data (e.g., donation date).
 * @param searchFor - The date string the user is searching for.
 * @returns A score between 0 (perfect match) and 1 (no match). Implementation TBD.
 */

/**
 * Fuzzy match two date strings for search purposes.
 *
 * @param searchWithin - The date string from the data (e.g., donation date, YYYY-MM-DD).
 * @param searchFor - The date string the user is searching for (flexible format).
 * @returns A score between 0 (no match) and 1 (perfect match).
 */
export function fuzzyDateMatch({
  searchWithin,
  searchFor,
  toleranceDays = 7,
}: {
  searchWithin: string;
  searchFor: string;
  toleranceDays?: number;
}): number {
  // Normalize and parse the data date
  const [dataYear, dataMonth, dataDay] = searchWithin.split("-").map(Number);
  if (!dataYear || !dataMonth || !dataDay) return 0;

  // Normalize user input
  const input = searchFor.trim().replace(/\s+/g, "").replace(/[/]/g, "-");
  const parts = input
    .split("-")
    .map((p) => p.replace(/^0+/, ""))
    .filter(Boolean);

  // Helper: try to parse year, month, day from any order
  let year: number | undefined,
    month: number | undefined,
    day: number | undefined;
  for (const part of parts) {
    if (part.length === 4 && !year) {
      year = Number(part);
    } else if (part.length <= 2 && !month) {
      month = Number(part);
    } else if (part.length <= 2 && !day) {
      day = Number(part);
    }
  }

  // A. Year only
  if (parts.length === 1 && year) {
    if (dataYear === year) return 0.2;
    return 0;
  }

  // B. Year and month (any order)
  if (parts.length === 2 && year && month) {
    if (dataYear === year && dataMonth === month) return 0.7;
    return 0;
  }

  // C. Month and day (any order, no year)
  if (parts.length === 2 && month && day && !year) {
    if (dataMonth === month && dataDay === day) return 1.0;
    return 0;
  }

  // D. Full date (any order, all present)
  if (parts.length === 3 && year && month && day) {
    // Try to construct a date from user input
    // Try YYYY-MM-DD, MM-DD-YYYY, DD-MM-YYYY, etc.
    const tryDates = [
      [year, month, day],
      [year, day, month],
      [month, day, year],
      [day, month, year],
    ];
    for (const [y, m, d] of tryDates) {
      if (!y || !m || !d) continue;
      // Compare to data date
      const dataDate = new Date(dataYear, dataMonth - 1, dataDay);
      const inputDate = new Date(y, m - 1, d);
      // Manual difference in days
      const msPerDay = 24 * 60 * 60 * 1000;
      const daysDiff = Math.abs(
        Math.floor((dataDate.getTime() - inputDate.getTime()) / msPerDay)
      );
      if (daysDiff <= toleranceDays) return 1.0;
    }
    return 0;
  }

  // No match
  return 0;
}
import { z } from "zod";

// Schema for YYYY-MM-DD date strings where year starts with 19 or 20
export const DateIsoSchema = z
  .string()
  .regex(
    /^(19|20)\d{2}-(0\d|1\d)-(0\d|1\d|2\d|3\d)$/,
    "Date must be in format YYYY-MM-DD (e.g., 2024-06-01)"
  );

// Get current date in local timezone as YYYY-MM-DD
export const getCurrentDateIso = (): string =>
  new Date().toLocaleDateString("en-CA");

export const getCurrentYear = (): number => new Date().getFullYear();

export const extractYear = (dateIso: string): number =>
  parseInt(dateIso.substring(0, 4));

// Compare dates for sorting (newest first)
export const compareDatesDesc = (a: string, b: string): number =>
  b.localeCompare(a);
