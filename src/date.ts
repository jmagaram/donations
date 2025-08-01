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
