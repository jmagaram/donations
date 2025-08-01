import { z } from "zod";

// Schema for YYYY-MM-DD date strings
export const DateIsoSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// Get current date in local timezone as YYYY-MM-DD
export const getCurrentDateIso = (): string =>
  new Date().toLocaleDateString("en-CA");

export const getCurrentYear = (): number => new Date().getFullYear();

export const extractYear = (dateIso: string): number =>
  parseInt(dateIso.substring(0, 4));

// Compare dates for sorting (newest first)
export const compareDatesDesc = (a: string, b: string): number =>
  b.localeCompare(a);
