import {
  parseDigits,
  getDateRange,
  extendDateRange,
  overlapRanges,
  rangePrecision,
  looksLikeDate,
  convertTwoDigitsToDateParts,
} from "./date";
import { describe, test, expect } from "vitest";

describe("parseDigits", () => {
  const validParseDigitsCases = [
    { input: "2025-3-14", output: [2025, 3, 14] },
    { input: "2025/3/14", output: [2025, 3, 14] },
    { input: "3/2025", output: [3, 2025] },
    { input: "   3/2025   ", output: [3, 2025], notes: "trims whitespace" },
    { input: "2025", output: [2025] },
    {
      input: "02025/03/04",
      output: [2025, 3, 4],
      notes: "strips leading zeroes",
    },
  ];

  const invalidParseDigitsCases = [
    { input: "2025/3-14", reason: "mixing separators" },
    { input: "-2025", reason: "leading dash" },
    { input: "2025-", reason: "trailing dash" },
    { input: "2025--3", reason: "missing number between separators" },
    { input: "2025-3-14-7", reason: "too many parts" },
    { input: "2025-abc-14", reason: "non-numeric part" },
    { input: "", reason: "empty string" },
    { input: "   ", reason: "whitespace only" },
    { input: "abc", reason: "letters only" },
    { input: "2025.03.14", reason: "unsupported separator" },
  ];

  test("parses valid digit patterns", () => {
    validParseDigitsCases.forEach(({ input, output }) => {
      expect(parseDigits(input)).toEqual(output);
    });
  });

  test("rejects invalid digit patterns", () => {
    invalidParseDigitsCases.forEach(({ input }) => {
      expect(parseDigits(input)).toBeUndefined();
    });
  });

  validParseDigitsCases.forEach(({ input, output, notes }) => {
    test(`parses "${input}" to ${JSON.stringify(output)}${
      notes ? ` (${notes})` : ""
    }`, () => {
      expect(parseDigits(input)).toEqual(output);
    });
  });

  invalidParseDigitsCases.forEach(({ input, reason }) => {
    test(`rejects "${input}" (${reason})`, () => {
      expect(parseDigits(input)).toBeUndefined();
    });
  });
});

describe("convertTwoDigitsToDateParts", () => {
  const validTwoDigitCases = [
    {
      input: [3, 2025],
      expectedToContain: [{ kind: "ym", year: 2025, month: 3 }],
      notes: "month/year",
    },
    {
      input: [3, 25],
      expectedToContain: [
        { kind: "ym", year: 2025, month: 3 },
        { kind: "md", month: 3, day: 25 },
      ],
      notes: "ambiguous: month/abbreviated year and month/day",
    },
    {
      input: [2025, 3],
      expectedToContain: [{ kind: "ym", year: 2025, month: 3 }],
      notes: "year/month",
    },
    {
      input: [3, 14],
      expectedToContain: [
        { kind: "md", month: 3, day: 14 },
        { kind: "ym", year: 2014, month: 3 },
      ],
      notes: "ambiguous: month/day and month/abbreviated year",
    },
    {
      input: [12, 31],
      expectedToContain: [
        { kind: "md", month: 12, day: 31 },
        { kind: "ym", year: 2031, month: 12 },
      ],
      notes: "ambiguous: month/day and month/abbreviated year",
    },
    {
      input: [1, 1],
      expectedToContain: [{ kind: "md", month: 1, day: 1 }],
      notes: "minimum month/day values",
    },
    {
      input: [3, 5],
      expectedToContain: [{ kind: "md", month: 3, day: 5 }],
      notes: "month/day (no abbreviated year interpretation since 5 < 10)",
    },
    {
      input: [12, 2035],
      expectedToContain: [{ kind: "ym", year: 2035, month: 12 }],
      notes: "maximum year boundary",
    },
    {
      input: [1, 10],
      expectedToContain: [
        { kind: "md", month: 1, day: 10 },
        { kind: "ym", year: 2010, month: 1 },
      ],
      notes: "ambiguous: month/day and month/abbreviated year",
    },
  ];

  const invalidTwoDigitCases = [
    { input: [13, 45], reason: "invalid month and day (both out of range)" },
    { input: [0, 5], reason: "zero month" },
    { input: [15, 40], reason: "invalid month and day (both out of range)" },
    { input: [3, 0], reason: "zero day" },
    { input: [3, 2009], reason: "year below valid range" },
    { input: [3, 2036], reason: "year above valid range" },
    { input: [13, 2025], reason: "invalid month" },
    { input: [0, 0], reason: "zero month and day" },
    { input: [50, 60], reason: "both values out of all valid ranges" },
  ];

  test("parses valid two-digit patterns", () => {
    validTwoDigitCases.forEach(({ input, expectedToContain }) => {
      const result = convertTwoDigitsToDateParts(input);
      expect(result).toBeDefined();
      expect(result !== undefined && result.length).toBeGreaterThan(0);

      expectedToContain.forEach((expectedItem) => {
        expect(result).toContainEqual(expectedItem);
      });
    });
  });

  test("rejects invalid two-digit patterns", () => {
    invalidTwoDigitCases.forEach(({ input }) => {
      expect(convertTwoDigitsToDateParts(input)).toBeUndefined();
    });
  });

  validTwoDigitCases.forEach(({ input, expectedToContain, notes }) => {
    test(`parses [${input.join(", ")}] (${notes})`, () => {
      const result = convertTwoDigitsToDateParts(input);
      expect(result).toBeDefined();

      expectedToContain.forEach((expectedItem) => {
        expect(result).toContainEqual(expectedItem);
      });

      // Ensure we don't get extra unexpected items
      expect(result).toHaveLength(expectedToContain.length);
    });
  });

  invalidTwoDigitCases.forEach(({ input, reason }) => {
    test(`rejects [${input.join(", ")}] (${reason})`, () => {
      expect(convertTwoDigitsToDateParts(input)).toBeUndefined();
    });
  });
});

describe("extendDateRange", () => {
  test("extends March 2025 month range with 3-day tolerance", () => {
    const marchRanges = getDateRange({
      parts: { kind: "ym", year: 2025, month: 3 },
    });
    const extendedRange = extendDateRange(marchRanges[0], 3);

    // March 2025: March 1 - March 31
    // With 3-day tolerance: Feb 26 - Apr 3
    expect(extendedRange.start).toEqual(new Date(2025, 1, 26)); // Feb 26
    expect(extendedRange.end).toEqual(new Date(2025, 3, 3)); // Apr 3
  });

  test("extends specific date with 3-day tolerance", () => {
    const specificDateRanges = getDateRange({
      parts: { kind: "ymd", year: 2025, month: 3, day: 15 },
    });
    const extendedRange = extendDateRange(specificDateRanges[0], 3);

    // March 15, 2025 with 3-day tolerance: March 12 - March 18
    expect(extendedRange.start).toEqual(new Date(2025, 2, 12)); // Mar 12
    expect(extendedRange.end).toEqual(new Date(2025, 2, 18)); // Mar 18
  });

  test("extends range with zero tolerance (no change)", () => {
    const originalRanges = getDateRange({
      parts: { kind: "ymd", year: 2025, month: 3, day: 15 },
    });
    const extendedRange = extendDateRange(originalRanges[0], 0);

    expect(extendedRange.start).toEqual(originalRanges[0].start);
    expect(extendedRange.end).toEqual(originalRanges[0].end);
  });
});

describe("overlapRanges", () => {
  const makeRange = (start: string, end: string) => ({
    start: new Date(start),
    end: new Date(end),
  });

  test("overlapping ranges (range1 starts first) return true", () => {
    const range1 = makeRange("2025-03-10", "2025-03-20");
    const range2 = makeRange("2025-03-15", "2025-03-25");
    expect(overlapRanges(range1, range2)).toBe(true);
  });

  test("overlapping ranges (range2 starts first) return true", () => {
    const range1 = makeRange("2025-03-15", "2025-03-30");
    const range2 = makeRange("2025-03-10", "2025-03-20");
    expect(overlapRanges(range1, range2)).toBe(true);
  });

  test("touching ranges (range1 ends when range2 starts) return true", () => {
    const range1 = makeRange("2025-03-10", "2025-03-15");
    const range2 = makeRange("2025-03-15", "2025-03-20");
    expect(overlapRanges(range1, range2)).toBe(true);
  });

  test("touching ranges (range2 ends when range1 starts) return true", () => {
    const range1 = makeRange("2025-03-15", "2025-03-20");
    const range2 = makeRange("2025-03-10", "2025-03-15");
    expect(overlapRanges(range1, range2)).toBe(true);
  });

  test("non-overlapping ranges return false", () => {
    const range1 = makeRange("2025-03-10", "2025-03-15");
    const range2 = makeRange("2025-03-20", "2025-03-25");
    expect(overlapRanges(range1, range2)).toBe(false);
  });

  test("one range completely inside another returns true", () => {
    const range1 = makeRange("2025-03-10", "2025-03-30");
    const range2 = makeRange("2025-03-15", "2025-03-20");
    expect(overlapRanges(range1, range2)).toBe(true);
  });

  test("identical ranges return true", () => {
    const range1 = makeRange("2025-03-15", "2025-03-20");
    const range2 = makeRange("2025-03-15", "2025-03-20");
    expect(overlapRanges(range1, range2)).toBe(true);
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
