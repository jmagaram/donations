import {
  parseDigits,
  parseInteger,
  getDateRange,
  extendDateRange,
  rangesOverlap,
  rangePrecision,
  looksLikeDate,
  convertDigitsToDatePatterns,
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

  // Test symmetry property: rangesOverlap(A, B) should equal rangesOverlap(B, A)
  const symmetryTestCases = [
    ["2025-03-10", "2025-03-20", "2025-03-15", "2025-03-25"], // overlapping
    ["2025-03-10", "2025-03-15", "2025-03-15", "2025-03-20"], // touching
    ["2025-03-10", "2025-03-15", "2025-03-20", "2025-03-25"], // non-overlapping
    ["2025-03-10", "2025-03-30", "2025-03-15", "2025-03-20"], // containment
  ];

  test.each(symmetryTestCases)(
    "symmetry: ranges %s-%s and %s-%s",
    (start1, end1, start2, end2) => {
      const r1 = makeRange(start1, end1);
      const r2 = makeRange(start2, end2);
      expect(rangesOverlap(r1, r2)).toBe(rangesOverlap(r2, r1));
    }
  );
});

describe("extendDateRange", () => {
  test("extends March 2025 month range with 3-day tolerance", () => {
    const marchRanges = getDateRange({
      pattern: { kind: "ym", year: 2025, month: 3 },
    });
    const extendedRange = extendDateRange(marchRanges[0], 3);

    // March 2025: March 1 - March 31
    // With 3-day tolerance: Feb 26 - Apr 3
    expect(extendedRange.start).toEqual(new Date(2025, 1, 26)); // Feb 26
    expect(extendedRange.end).toEqual(new Date(2025, 3, 3)); // Apr 3
  });

  test("extends specific date with 3-day tolerance", () => {
    const specificDateRanges = getDateRange({
      pattern: { kind: "ymd", year: 2025, month: 3, day: 15 },
    });
    const extendedRange = extendDateRange(specificDateRanges[0], 3);

    // March 15, 2025 with 3-day tolerance: March 12 - March 18
    expect(extendedRange.start).toEqual(new Date(2025, 2, 12)); // Mar 12
    expect(extendedRange.end).toEqual(new Date(2025, 2, 18)); // Mar 18
  });

  test("extends range with zero tolerance (no change)", () => {
    const originalRanges = getDateRange({
      pattern: { kind: "ymd", year: 2025, month: 3, day: 15 },
    });
    const extendedRange = extendDateRange(originalRanges[0], 0);

    expect(extendedRange.start).toEqual(originalRanges[0].start);
    expect(extendedRange.end).toEqual(originalRanges[0].end);
  });
});

describe("rangePrecision", () => {
  const makeRange = (start: string, end: string) => ({
    start: new Date(start),
    end: new Date(end),
  });

  test("same day range returns perfect precision (1.0)", () => {
    const range = makeRange("2025-03-15", "2025-03-15");
    expect(rangePrecision(range)).toBe(1.0);
  });

  test("1-6 day range returns high precision (0.8)", () => {
    const range1 = makeRange("2025-03-15", "2025-03-16"); // 1 day
    const range6 = makeRange("2025-03-15", "2025-03-21"); // 6 days
    expect(rangePrecision(range1)).toBe(0.8);
    expect(rangePrecision(range6)).toBe(0.8);
  });

  test("7-29 day range returns good precision (0.6)", () => {
    const range7 = makeRange("2025-03-15", "2025-03-22"); // 7 days
    const range29 = makeRange("2025-03-01", "2025-03-30"); // 29 days
    expect(rangePrecision(range7)).toBe(0.6);
    expect(rangePrecision(range29)).toBe(0.6);
  });

  test("30-364 day range returns medium precision (0.4)", () => {
    const range30 = makeRange("2025-03-01", "2025-03-31"); // 30 days (full month)
    const range364 = makeRange("2025-01-01", "2025-12-31"); // 364 days (full year minus 1)
    expect(rangePrecision(range30)).toBe(0.4);
    expect(rangePrecision(range364)).toBe(0.4);
  });

  test("365+ day range returns low precision (0.2)", () => {
    const range365 = makeRange("2024-01-01", "2024-12-31"); // 365 days (full year)
    const range400 = makeRange("2024-01-01", "2025-02-05"); // 400+ days
    expect(rangePrecision(range365)).toBe(0.2);
    expect(rangePrecision(range400)).toBe(0.2);
  });
});

describe("looksLikeDate", () => {
  const validDatePatterns = [
    "8/26", // month/day
    "2025", // year only (2010-2035)
    "3/2025", // month/year
    "2025-03-15", // year-month-day
    "12/25/2025", // month/day/year
    "2025-3", // year-month
    "3/24", // month/abbreviated year (10-35 becomes 2010-2035)
    "03/14", // month/day with leading zero
    "2024/12/31", // year/month/day
    "1/1", // single digit month/day
    "2025-02-30", // function doesn't validate calendar dates, only ranges
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

  test("recognizes valid date patterns", () => {
    validDatePatterns.forEach((input) => {
      expect(looksLikeDate(input)).toBe(true);
    });
  });

  validDatePatterns.forEach((input) => {
    test(`recognizes "${input}" as a valid date`, () => {
      expect(looksLikeDate(input)).toBe(true);
    });
  });

  invalidDatePatterns.forEach(({ input, reason }) => {
    test(`rejects "${input}" (${reason})`, () => {
      expect(looksLikeDate(input)).toBe(false);
    });
  });
});
