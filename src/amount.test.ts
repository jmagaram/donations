import { describe, expect, test } from "vitest";
import { parseCurrency } from "./amount";

describe("parseCurrency", () => {
  test.each([
    ["123", 123],
    ["$123", 123],
    ["1,234", 1234],
    ["$1,234.56", 1234.56],
    ["-123", -123],
    ["-$123.45", -123.45],
    ["  $1,234.56  ", 1234.56],
    ["0", 0],
    ["0.01", 0.01],
    ["1000000", 1000000],
    ["$1,000,000.99", 1000000.99],
  ])("valid currency '%s' to %s", (input, expected) => {
    expect(parseCurrency(input)).toBe(expected);
  });

  test.each([
    ["abc", "Non-numeric text"],
    ["$abc", "Currency symbol with non-numeric text"],
    ["", "Empty string"],
    ["$", "Currency symbol only"],
    ["12.34.56", "Multiple decimal points"],
    ["12,34.56", "Invalid comma placement"],
    ["$12€34", "Multiple currency symbols"],
    ["NaN", "NaN string"],
    ["Infinity", "Infinity string"],
    ["-", "Minus sign only"],
    ["--123", "Double minus sign"],
  ])("invalid currency '%s' (%s)", (input) => {
    expect(parseCurrency(input)).toBeUndefined();
  });
});
