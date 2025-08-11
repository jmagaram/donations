import z from "zod";

export type DateParts =
  | { kind: "y"; year: number }
  | { kind: "ym"; year: number; month: number }
  | { kind: "my"; year: number; month: number }
  | { kind: "ymd"; year: number; month: number; day: number }
  | { kind: "md"; month: number; day: number };

type DateRange = {
  start: Date;
  end: Date;
};

/**
 * Parses a string into 1, 2, or 3 digits, splitting on dash (-) and slash (/) characters. The input is trimmed before parsing. Mixed separators are not allowed. Examples:
 * '2025-3-14' => [2025, 3, 14]
 * '3/17' => [3, 17]
 */
export const parseDigits = (input: string): number[] | undefined => {
  if (typeof input !== "string") return undefined;
  const trimmed = input.trim();
  if (!/^[\d\-/]*$/.test(trimmed)) return undefined;
  // Disallow mixed separators
  if (trimmed.includes("-") && trimmed.includes("/")) return undefined;
  const parts = trimmed.split(/[-/]/);
  if (parts.length < 1 || parts.length > 3) return undefined;
  const nums = parts.reduce<number[] | undefined>((acc, part) => {
    if (acc === undefined) return undefined;
    if (part === "") return undefined;
    const n = Number(part);
    if (!Number.isFinite(n)) return undefined;
    return [...acc, n];
  }, []);
  if (!nums || nums.length < 1 || nums.length > 3) return undefined;
  return nums;
};

export const overlapRanges = (
  range1: DateRange,
  range2: DateRange
): boolean => {
  return range1.start <= range2.end && range2.start <= range1.end;
};

export const getDateRange = (params: {
  parts: DateParts;
  minYear?: number;
  maxYear?: number;
}): DateRange[] => {
  const { parts: d, minYear = 2010, maxYear = 2035 } = params;
  const toDate = (year: number, month: number, day: number) =>
    new Date(year, month - 1, day);
  switch (d.kind) {
    case "y":
      return [
        {
          start: toDate(d.year, 1, 1),
          end: toDate(d.year, 12, 31),
        },
      ];
    case "ym":
    case "my":
      return [
        {
          start: toDate(d.year, d.month, 1),
          end: toDate(d.year, d.month, 31),
        },
      ];
    case "ymd":
      return [
        {
          start: toDate(d.year, d.month, d.day),
          end: toDate(d.year, d.month, d.day),
        },
      ];
    case "md":
      return Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        const year = minYear + i;
        return {
          start: toDate(year, d.month, d.day),
          end: toDate(year, d.month, d.day),
        };
      });
  }
};

export const extendDateRange = (range: DateRange, toleranceDays: number) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return {
    start: new Date(range.start.getTime() - toleranceDays * msPerDay),
    end: new Date(range.end.getTime() + toleranceDays * msPerDay),
  };
};

const isYear = (n: number) => n >= 2010 && n <= 2035;
const isYearAbbrev = (n: number) => n >= 10 && n <= 35;
const convertYearAbbrev = (n: number) => n + 2000;
const isMonth = (n: number) => n >= 1 && n <= 12;
const isDay = (n: number) => n >= 1 && n <= 31;

const convertSingleDigitToDateParts = (
  nums: number[]
): DateParts[] | undefined => {
  const y = nums[0];
  if (isYear(y)) return [{ kind: "y", year: y }];
  return undefined;
};

const convertTwoDigitsToDateParts = (
  nums: number[]
): DateParts[] | undefined => {
  const result: DateParts[] = [];
  const [x, y] = nums;
  // MM-YYYY like 3/2025
  if (isMonth(x) && isYear(y)) {
    result.push({ kind: "ym", year: y, month: x });
  }
  // MM-YY like 3/25
  if (isMonth(x) && isYearAbbrev(y)) {
    result.push({ kind: "ym", year: convertYearAbbrev(y), month: x });
  }
  // YYYY-MM like 2025-03
  if (isYear(x) && isMonth(y)) {
    result.push({ kind: "ym", year: x, month: y });
  }
  // MM-DD like 3/14 or March 14
  if (isMonth(x) && isDay(y)) {
    result.push({ kind: "md", month: x, day: y });
  }
  return result.length > 0 ? result : undefined;
};

const convertThreeDigitsToDateParts = (
  nums: number[]
): DateParts[] | undefined => {
  const [x, y, z] = nums;
  // MM-DD-YYYY like 3/2/2025 (March 2, 2025)
  if (isMonth(x) && isDay(y) && isYear(z)) {
    return [{ kind: "ymd", year: z, month: x, day: y }];
  }
  // MM-DD-YY like 3/2/25 (March 2, 2025)
  if (isMonth(x) && isDay(y) && isYearAbbrev(z)) {
    return [{ kind: "ymd", year: convertYearAbbrev(z), month: x, day: y }];
  }
  // YYYY-MM-DD like 2025-03-01
  if (isYear(x) && isMonth(y) && isDay(z)) {
    return [{ kind: "ymd", year: x, month: y, day: z }];
  }
  return undefined;
};

export const convertDigitsToDateParts = (
  nums: number[]
): DateParts[] | undefined => {
  if (nums.length === 1) return convertSingleDigitToDateParts(nums);
  if (nums.length === 2) return convertTwoDigitsToDateParts(nums);
  if (nums.length === 3) return convertThreeDigitsToDateParts(nums);
  return undefined;
};

export const parseStringToDayRanges = (params: {
  input: string;
  minYear: number;
  maxYear: number;
}): DateRange[] => {
  const { input, minYear, maxYear } = params;
  const digits = parseDigits(input);
  if (digits === undefined) return [];
  const parts = convertDigitsToDateParts(digits);
  if (parts === undefined) return [];
  return parts
    .map((p) => getDateRange({ parts: p, minYear, maxYear }))
    .flatMap((i) => i);
};

// Fast check if a string looks like a date without doing full parsing
export const looksLikeDate = (input: string): boolean => {
  const digits = parseDigits(input);
  return digits ? convertDigitsToDateParts(digits) !== undefined : false;
};

// Helper function to calculate the number of days in a date range (inclusive)
export const daysInRange = (range: DateRange): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((range.end.getTime() - range.start.getTime()) / msPerDay);
};

// Returns precision score based on date range size. Smaller ranges = higher precision scores for fuzzy matching
export const rangePrecision = (range: DateRange): number => {
  const days = daysInRange(range);

  if (days === 0) return 1.0; // Same day - perfect precision
  if (days <= 6) return 0.8; // Few days - high precision
  if (days <= 29) return 0.6; // Week-ish - good precision
  if (days <= 364) return 0.4; // Month-ish - medium precision
  return 0.2; // Year+ - low precision
};

export const overlapPrecision = (r1: DateRange, r2: DateRange): number => {
  if (!overlapRanges(r1, r2)) return 0.0;
  return Math.min(rangePrecision(r1), rangePrecision(r2));
};

export const fuzzyDateSearch = (params: {
  searchFor: string;
  target: Date;
  minYear: number;
  maxYear: number;
  toleranceDays: number;
}) => {
  const searchForRanges = parseStringToDayRanges({
    input: params.searchFor,
    minYear: params.minYear,
    maxYear: params.maxYear,
  });
  if (searchForRanges.length === 0) return 0.0;
  const targetRange = { start: params.target, end: params.target };
  const extendedTargetRange = extendDateRange(
    targetRange,
    params.toleranceDays
  );
  const results = searchForRanges.map((r) =>
    overlapPrecision(r, extendedTargetRange)
  );
  return Math.max(...results);
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
