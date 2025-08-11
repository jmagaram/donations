import {
  parseDigits,
  parseInteger,
  rangesOverlap,
  looksLikeDate,
  convertDigitsToDatePatterns,
  addDays,
  fullDaysInRange,
  type DatePattern,
} from "./date";
import { describe, test, expect } from "vitest";

describe("parseInteger", () => {
  test.each([
    ["0", 0],
    ["1", 1],
    ["9", 9],
    ["01", 1],
    ["09", 9],
    ["10", 10],
    ["99", 99],
    ["1000", 1000],
    ["9999", 9999],
    ["0123", 123],
    ["0999", 999],
  ])("valid %s to %i", (input, expected) => {
    expect(parseInteger(input)).toBe(expected);
  });

  test.each([
    ["00", "double zero"],
    ["000", "triple zero"],
    ["0000", "quadruple zero"],
    ["001", "too many leading zeros"],
    ["0012", "too many leading zeros"],
    ["123", "three digits"],
    ["12345", "five digits"],
    ["abc", "non-numeric"],
    ["", "empty string"],
    ["-1", "negative number"],
    ["1.5", "decimal"],
    [" 1", "leading space"],
    ["1 ", "trailing space"],
  ])("rejects %s (%s)", (input) => {
    expect(parseInteger(input)).toBeUndefined();
  });
});

describe("parseDigits", () => {
  const mockParseFn = (s: string): number | undefined => {
    if (s === "reject") return undefined;
    return parseInt(s, 10);
  };

  test.each([
    ["1-2-3", [1, 2, 3]],
    ["10/20/30", [10, 20, 30]],
    ["5", [5]],
    ["100-200", [100, 200]],
  ])('parses "%s" to %j', (input, expected) => {
    expect(parseDigits(input, mockParseFn)).toEqual(expected);
  });

  test.each([
    ["1-reject-3", "digit rejection"],
    ["reject", "single digit rejection"],
    ["1/2-3", "mixed separators"],
    ["", "empty string"],
    ["1-2-3-4", "too many parts"],
  ])('rejects "%s" (%s)', (input) => {
    expect(parseDigits(input, mockParseFn)).toBeUndefined();
  });
});

describe("convertDigitsToDatePatterns", () => {
  const testCases: Array<{
    input: number[];
    expected: DatePattern[];
    description: string;
  }> = [
    // Single digit cases
    {
      input: [2025],
      expected: [{ kind: "y", year: 2025 }],
      description: "single year",
    },
    {
      input: [1934],
      expected: [],
      description: "year too low",
    },
    {
      input: [2087],
      expected: [],
      description: "year too high",
    },

    // Two digit cases
    {
      input: [3, 2025],
      expected: [{ kind: "ym", year: 2025, month: 3 }],
      description: "March 2025",
    },
    {
      input: [3, 25],
      expected: [
        { kind: "ym", year: 2025, month: 3 },
        { kind: "md", month: 3, day: 25 },
      ],
      description: "March 2025 and March 25th",
    },
    {
      input: [2025, 3],
      expected: [{ kind: "ym", year: 2025, month: 3 }],
      description: "March 2025",
    },
    {
      input: [12, 25],
      expected: [
        { kind: "ym", year: 2025, month: 12 },
        { kind: "md", month: 12, day: 25 },
      ],
      description: "December 2025 or December 25th",
    },
    {
      input: [13, 2025],
      expected: [],
      description: "Month too big",
    },
    {
      input: [5, 2099],
      expected: [],
      description: "Year too big",
    },
    {
      input: [13, 45],
      expected: [],
      description: "Month and year are both invalid",
    },

    // Three digit cases
    {
      input: [3, 14, 2025],
      expected: [{ kind: "ymd", year: 2025, month: 3, day: 14 }],
      description: "March 14, 2025",
    },
    {
      input: [3, 14, 25],
      expected: [{ kind: "ymd", year: 2025, month: 3, day: 14 }],
      description: "March 14, 2025",
    },
    {
      input: [2025, 3, 14],
      expected: [{ kind: "ymd", year: 2025, month: 3, day: 14 }],
      description: "March 14, 2025",
    },
    {
      input: [13, 14, 2025],
      expected: [],
      description: "Invalid month",
    },
  ];

  test.each(testCases)("$input => $description", ({ input, expected }) => {
    const result = convertDigitsToDatePatterns(input);
    expect(result).toHaveLength(expected.length);
    if (expected.length > 0) {
      expect(result).toEqual(expect.arrayContaining(expected));
      expected.forEach((expectedPattern) => {
        expect(result).toContainEqual(expectedPattern);
      });
    }
  });
});

describe("rangesOverlap", () => {
  const makeRange = (start: string, end: string) => ({
    start: new Date(start),
    end: new Date(end),
  });

  const testCases = [
    {
      range1: ["2025-03-10", "2025-03-20"],
      range2: ["2025-03-15", "2025-03-25"],
      expected: true,
      description: "overlapping ranges",
    },
    {
      range1: ["2025-03-10", "2025-03-15"],
      range2: ["2025-03-15", "2025-03-20"],
      expected: true,
      description: "touching ranges",
    },
    {
      range1: ["2025-03-10", "2025-03-15"],
      range2: ["2025-03-20", "2025-03-25"],
      expected: false,
      description: "non-overlapping ranges",
    },
    {
      range1: ["2025-03-10", "2025-03-30"],
      range2: ["2025-03-15", "2025-03-20"],
      expected: true,
      description: "one range completely inside another",
    },
    {
      range1: ["2025-03-15", "2025-03-20"],
      range2: ["2025-03-15", "2025-03-20"],
      expected: true,
      description: "identical ranges",
    },
  ];

  test.each(testCases)("$description", ({ range1, range2, expected }) => {
    const r1 = makeRange(range1[0], range1[1]);
    const r2 = makeRange(range2[0], range2[1]);
    expect(rangesOverlap(r1, r2)).toBe(expected);
  });

  test.each(testCases)("symmetry $description", ({ range1, range2 }) => {
    const r1 = makeRange(range1[0], range1[1]);
    const r2 = makeRange(range2[0], range2[1]);
    expect(rangesOverlap(r1, r2)).toBe(rangesOverlap(r2, r1));
  });
});

describe("addDays", () => {
  test.each([
    [new Date(2025, 2, 15), 0, new Date(2025, 2, 15)],
    [new Date(2025, 2, 15), 3, new Date(2025, 2, 18)],
    [new Date(2025, 2, 15), -3, new Date(2025, 2, 12)],
    [new Date(2025, 2, 31), 1, new Date(2025, 3, 1)],
    [new Date(2025, 0, 1), -1, new Date(2024, 11, 31)],
  ])("adds $1 days to date", (inputDate, days, expected) => {
    expect(addDays(inputDate, days)).toEqual(expected);
  });
});

describe("fullDaysInRange", () => {
  const makeRange = (start: Date, end: Date) => ({ start, end });

  test.each([
    // Same day - exactly 0 days
    {
      start: new Date(2025, 2, 15, 10, 0, 0),
      end: new Date(2025, 2, 15, 10, 0, 0),
      expected: 0,
      description: "same exact moment",
    },
    {
      start: new Date(2025, 2, 15, 0, 0, 0),
      end: new Date(2025, 2, 15, 23, 59, 59),
      expected: 0,
      description: "same day different times",
    },
    {
      start: new Date(2025, 2, 15, 10, 0, 0),
      end: new Date(2025, 2, 16, 9, 50, 0),
      expected: 0,
      description: "1 day minus 10 minutes",
    },
    {
      start: new Date(2025, 2, 15, 10, 0, 0),
      end: new Date(2025, 2, 16, 10, 0, 0),
      expected: 1,
      description: "exactly 24 hours",
    },
    {
      start: new Date(2025, 2, 15, 10, 0, 0),
      end: new Date(2025, 2, 16, 10, 10, 0),
      expected: 1,
      description: "1 day plus 10 minutes",
    },
    {
      start: new Date(2025, 2, 15, 0, 0, 0),
      end: new Date(2025, 2, 18, 0, 0, 0),
      expected: 3,
      description: "exactly 3 days",
    },
    {
      start: new Date(2025, 2, 15, 10, 0, 0),
      end: new Date(2025, 2, 18, 14, 0, 0),
      expected: 3,
      description: "3 days plus 4 hours",
    },
    {
      start: new Date(2025, 2, 16, 10, 0, 0),
      end: new Date(2025, 2, 15, 10, 0, 0),
      expected: 0,
      description: "starts after end",
    },
  ])("$description => $expected", ({ start, end, expected }) => {
    const range = makeRange(start, end);
    expect(fullDaysInRange(range)).toBe(expected);
  });
});

describe("looksLikeDate", () => {
  const validDatePatterns = [
    "8/26",
    "2025",
    "3/2025",
    "2025-03-15",
    "12/25/2025",
    "2025-3",
    "3/24",
    "03/14",
    "2024/12/31",
    "1/1",
    "2025-02-30",
  ];

  const invalidDatePatterns = [
    { input: "hello", reason: "has letters not numbers" },
    { input: "abc123", reason: "mixed letters and numbers" },
    { input: "", reason: "is empty" },
    { input: "13/45", reason: "invalid month/day values" },
    { input: "2025/13/01", reason: "invalid month" },
    { input: "2025/3-14", reason: "mixed separators" },
    { input: "2025-3/14", reason: "mixed separators" },
    { input: "2025--03", reason: "double separator" },
    { input: "2025/", reason: "trailing separator" },
    { input: "/2025", reason: "leading separator" },
    { input: "2025/3/14/5", reason: "too many parts" },
    { input: "abc/def", reason: "non-numeric parts" },
    { input: "2025.03.14", reason: "unsupported separator" },
    { input: "  ", reason: "whitespace only" },
    { input: "0/0", reason: "invalid month/day zero" },
    { input: "2000", reason: "year outside valid range" },
    { input: "2040", reason: "year outside valid range" },
    {
      input: "24",
      reason: "single digits only valid as full years (2010-2035)",
    },
    {
      input: "25",
      reason: "single digits only valid as full years (2010-2035)",
    },
    {
      input: "9",
      reason: "single digits only valid as full years (2010-2035)",
    },
    {
      input: "36",
      reason: "single digits only valid as full years (2010-2035)",
    },
  ];

  test.each(validDatePatterns)("recognizes %s", (input) => {
    expect(looksLikeDate(input)).toBe(true);
  });

  test.each(invalidDatePatterns)("rejects $input $reason", ({ input }) => {
    expect(looksLikeDate(input)).toBe(false);
  });
});
