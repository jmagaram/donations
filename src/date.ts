import z from "zod";

/**
 * Parses a string to an integer if it matches the expected format.
 * Accepts numbers that are 1, 2, or 4 digits long, allowing at most one leading zero.
 */
export const parseInteger = (input: string): number | undefined => {
  const validNumRegex = /^(\d|[1-9]\d|0[1-9]|[1-9]\d{3}|0[1-9]\d{2})$/;
  if (!validNumRegex.test(input)) return undefined;
  return Number(input);
};

/**
 * Parses a string into an array of 1 to 3 numbers by splitting on dash (-) or slash (/).
 *
 * - The input string is trimmed before parsing.
 * - Mixed separators (both '-' and '/') are not allowed.
 * - Each part must be a non-empty string of digits.
 * - Numbers must be exactly 1, 2, or 4 digits long.
 * - Each number can have at most 1 leading zero.
 *
 * Examples:
 * - "2025-3-14" => [2025, 3, 14]
 * - "03/2025" => [3, 2025]
 *
 * @param input - The date string to parse.
 * @param parseDigitFn - Function to parse individual digit strings. Defaults to parseInteger.
 * @returns An array of numbers if parsing is successful, otherwise `undefined`.
 */
export const parseDigits = (
  input: string,
  parseDigitFn: (part: string) => number | undefined = parseInteger
): number[] | undefined => {
  if (typeof input !== "string") return undefined;
  const trimmed = input.trim();
  const hasDash = trimmed.includes("-");
  const hasSlash = trimmed.includes("/");
  if (hasDash && hasSlash) return undefined;
  const parts = trimmed.split(/[-/]/);
  if (parts.length < 1 || parts.length > 3) return undefined;
  const nums = parts.reduce<number[] | undefined>((acc, part) => {
    if (acc === undefined) return undefined;
    if (part === "") return undefined;
    const n = parseDigitFn(part);
    if (n === undefined) return undefined;
    return [...acc, n];
  }, []);
  if (!nums || nums.length < 1 || nums.length > 3) return undefined;
  return nums;
};

const YEAR_CENTURY_BASE = 2000;
const MIN_YEAR_OFFSET = 10;
const MAX_YEAR_OFFSET = 35;
export const MIN_PARSE_YYYY = YEAR_CENTURY_BASE + MIN_YEAR_OFFSET;
export const MAX_PARSE_YYYY = YEAR_CENTURY_BASE + MAX_YEAR_OFFSET;
const MIN_PARSE_YY = MIN_YEAR_OFFSET;
const MAX_PARSE_YY = MAX_YEAR_OFFSET;

const isYear = (n: number) => n >= MIN_PARSE_YYYY && n <= MAX_PARSE_YYYY;
const isYearAbbrev = (n: number) => n >= MIN_PARSE_YY && n <= MAX_PARSE_YY;
const convertYearAbbrev = (n: number) => n + YEAR_CENTURY_BASE;
const isMonth = (n: number) => n >= 1 && n <= 12;
const isDay = (n: number) => n >= 1 && n <= 31;

const getLastDayOfMonth = ({
  year,
  month,
}: {
  year: number;
  month: number;
}): number => new Date(year, month, 0).getDate();

export type DatePattern =
  | { kind: "y"; year: number }
  | { kind: "ym"; year: number; month: number }
  | { kind: "ymd"; year: number; month: number; day: number }
  | { kind: "md"; month: number; day: number };

type DateValidators = {
  isYear: (n: number) => boolean;
  isYearAbbrev: (n: number) => boolean;
  isMonth: (n: number) => boolean;
  isDay: (n: number) => boolean;
  convertYearAbbrev: (n: number) => number;
};

const create_YYYY = (
  year: number,
  v: DateValidators
): DatePattern | undefined =>
  v.isYear(year) ? { kind: "y", year: year } : undefined;

const create_MM_YYYY = (
  month: number,
  year: number,
  v: DateValidators
): DatePattern | undefined =>
  v.isMonth(month) && v.isYear(year)
    ? { kind: "ym", year: year, month: month }
    : undefined;

const create_YYYY_MM = (
  year: number,
  month: number,
  v: DateValidators
): DatePattern | undefined =>
  v.isYear(year) && v.isMonth(month) ? { kind: "ym", year, month } : undefined;

const create_MM_YY = (
  month: number,
  abbrevYear: number,
  v: DateValidators
): DatePattern | undefined =>
  v.isMonth(month) && v.isYearAbbrev(abbrevYear)
    ? { kind: "ym", year: v.convertYearAbbrev(abbrevYear), month }
    : undefined;

const create_MM_DD = (
  month: number,
  day: number,
  v: DateValidators
): DatePattern | undefined =>
  v.isMonth(month) && v.isDay(day) ? { kind: "md", month, day } : undefined;

const create_MM_DD_YYYY = (
  month: number,
  day: number,
  year: number,
  v: DateValidators
): DatePattern | undefined =>
  v.isMonth(month) && v.isDay(day) && v.isYear(year)
    ? { kind: "ymd", year, month, day }
    : undefined;

const create_MM_DD_YY = (
  month: number,
  day: number,
  abbrevYear: number,
  v: DateValidators
): DatePattern | undefined =>
  v.isMonth(month) && v.isDay(day) && v.isYearAbbrev(abbrevYear)
    ? { kind: "ymd", year: v.convertYearAbbrev(abbrevYear), month, day }
    : undefined;

const create_YYYY_MM_DD = (
  year: number,
  month: number,
  day: number,
  v: DateValidators
): DatePattern | undefined =>
  v.isYear(year) && v.isMonth(month) && v.isDay(day)
    ? { kind: "ymd", year, month, day }
    : undefined;

export const convertDigitsToDatePatterns = (
  nums: number[],
  validators?: {
    isYear?: (n: number) => boolean;
    isYearAbbrev?: (n: number) => boolean;
    isMonth?: (n: number) => boolean;
    isDay?: (n: number) => boolean;
    convertYearAbbrev?: (n: number) => number;
  }
): DatePattern[] => {
  const v: DateValidators = {
    isYear: validators?.isYear ?? isYear,
    isYearAbbrev: validators?.isYearAbbrev ?? isYearAbbrev,
    isMonth: validators?.isMonth ?? isMonth,
    isDay: validators?.isDay ?? isDay,
    convertYearAbbrev: validators?.convertYearAbbrev ?? convertYearAbbrev,
  };

  if (nums.length === 1) {
    const [x] = nums;
    return [create_YYYY(x, v)].filter(
      (part): part is DatePattern => part !== undefined
    );
  }

  if (nums.length === 2) {
    const [x, y] = nums;
    return [
      create_MM_YYYY(x, y, v),
      create_MM_YY(x, y, v),
      create_YYYY_MM(x, y, v),
      create_MM_DD(x, y, v),
    ].filter((part): part is DatePattern => part !== undefined);
  }

  if (nums.length === 3) {
    const [x, y, z] = nums;
    return [
      create_MM_DD_YYYY(x, y, z, v),
      create_MM_DD_YY(x, y, z, v),
      create_YYYY_MM_DD(x, y, z, v),
    ].filter((part): part is DatePattern => part !== undefined);
  }

  return [];
};

type DateRange = {
  start: Date;
  end: Date;
};

export const getDateRange = (params: {
  pattern: DatePattern;
  minYear?: number;
  maxYear?: number;
}): DateRange[] => {
  const {
    pattern: p,
    minYear = MIN_PARSE_YYYY,
    maxYear = MAX_PARSE_YYYY,
  } = params;
  const dateFromYMD = (year: number, month: number, day: number) =>
    new Date(year, month - 1, day);
  switch (p.kind) {
    case "y":
      return [
        {
          start: dateFromYMD(p.year, 1, 1),
          end: dateFromYMD(p.year, 12, 31),
        },
      ];
    case "ym":
      return [
        {
          start: dateFromYMD(p.year, p.month, 1),
          end: dateFromYMD(
            p.year,
            p.month,
            getLastDayOfMonth({ year: p.year, month: p.month })
          ),
        },
      ];
    case "ymd":
      return [
        {
          start: dateFromYMD(p.year, p.month, p.day),
          end: dateFromYMD(p.year, p.month, p.day),
        },
      ];
    case "md":
      return Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        const year = minYear + i;
        return {
          start: dateFromYMD(year, p.month, p.day),
          end: dateFromYMD(year, p.month, p.day),
        };
      });
  }
};

export const rangesOverlap = (r1: DateRange, r2: DateRange): boolean => {
  return r1.start <= r2.end && r2.start <= r1.end;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const addDays = (date: Date, days: number): Date => {
  return new Date(date.getTime() + days * MS_PER_DAY);
};

export const fullDaysInRange = (range: DateRange): number => {
  if (range.start > range.end) return 0;
  return Math.floor((range.end.getTime() - range.start.getTime()) / MS_PER_DAY);
};

export const padDateRange = (range: DateRange, paddingDays: number) => {
  return {
    start: addDays(range.start, -paddingDays),
    end: addDays(range.end, paddingDays),
  };
};

export const parseStringToDayRanges = (params: {
  input: string;
  minYear: number;
  maxYear: number;
}): DateRange[] => {
  const { input, minYear, maxYear } = params;
  const digits = parseDigits(input);
  if (digits === undefined) return [];
  const parts = convertDigitsToDatePatterns(digits);
  if (parts.length === 0) return [];
  return parts
    .map((p) => getDateRange({ pattern: p, minYear, maxYear }))
    .flatMap((i) => i);
};

// Returns precision score using Fuse.js scale
// 0 = perfect match, 1 = worst
// Smaller date ranges get better scores for fuzzy matching
export const rangePrecision = (range: DateRange): number => {
  const days = fullDaysInRange(range);
  if (days <= 1) return 0.0; // perfect match, high precision
  if (days <= 6) return 0.2;
  if (days <= 29) return 0.4;
  if (days <= 45) return 0.6;
  if (days <= 365) return 0.8;
  return 1.0;
};

export const overlapPrecision = (r1: DateRange, r2: DateRange): number => {
  if (!rangesOverlap(r1, r2)) return 1.0; // No overlap - worst score
  return Math.min(rangePrecision(r1), rangePrecision(r2));
};

export const fuzzyDateSearchFromRanges = (params: {
  searchForRanges: DateRange[];
  target: Date;
  paddingDays: number;
}) => {
  if (params.searchForRanges.length === 0) return 1.0; // No ranges = worst score (Fuse.js scale)
  const targetRange = { start: params.target, end: params.target };
  const paddedTargetRange = padDateRange(targetRange, params.paddingDays);
  const results = params.searchForRanges.map((r) =>
    overlapPrecision(r, paddedTargetRange)
  );
  return Math.min(...results); // Best (lowest) score wins
};

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

export const compareDatesDesc = (a: string, b: string): number =>
  b.localeCompare(a);
