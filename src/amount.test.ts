import { describe, expect, test } from "vitest";
import { parseCurrency, formatUSD, isAmountWithinTolerancePercent } from "./amount";

describe("parseCurrency", () => {
  test.each([
    ["1", 1],
    ["12", 12],
    ["123", 123],
    ["1234", 1234],
    ["$123", 123],
    ["1.5", 1.5],
    ["1.57", 1.57],
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
    ["1 2", "Spaces inside"],
    ["1 2 3", "Spaces inside"],
    ["1 2 3", "Spaces inside"],
    ["123. 4", "Spaces inside"],
    ["-1 23", "Spaces inside"],
    ["abc", "Non-numeric text"],
    ["$abc", "Currency symbol with non-numeric text"],
    ["", "Empty string"],
    ["$", "Currency symbol only"],
    ["12.", "Not enough decimal places"],
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

describe("formatUSD", () => {
  test.each`
    amount     | pennies          | expected
    ${1.5}     | ${"hidePennies"} | ${"$2"}
    ${1.4}     | ${"hidePennies"} | ${"$1"}
    ${1.6}     | ${"hidePennies"} | ${"$2"}
    ${123}     | ${"showPennies"} | ${"$123.00"}
    ${123}     | ${"hidePennies"} | ${"$123"}
    ${123}     | ${undefined}     | ${"$123.00"}
    ${123.45}  | ${"showPennies"} | ${"$123.45"}
    ${123.45}  | ${"hidePennies"} | ${"$123"}
    ${0}       | ${"showPennies"} | ${"$0.00"}
    ${0}       | ${"hidePennies"} | ${"$0"}
    ${-123.45} | ${"showPennies"} | ${"-$123.45"}
    ${-123.45} | ${"hidePennies"} | ${"-$123"}
    ${1234.56} | ${"showPennies"} | ${"$1,234.56"}
    ${1234.56} | ${"hidePennies"} | ${"$1,235"}
    ${1000000} | ${"showPennies"} | ${"$1,000,000.00"}
    ${1000000} | ${"hidePennies"} | ${"$1,000,000"}
    ${0.01}    | ${"showPennies"} | ${"$0.01"}
    ${0.01}    | ${"hidePennies"} | ${"$0"}
    ${999.99}  | ${"hidePennies"} | ${"$1,000"}
  `(
    "formats $amount with pennies=$pennies to $expected",
    ({ amount, pennies, expected }) => {
      expect(formatUSD(amount, pennies)).toBe(expected);
    },
  );
});

describe("isAmountWithinTolerancePercent", () => {
  test.each([
    [100, 10, 100, true, "value === target; perfect match"],
    [100, 20, 105, true, "1/4 of tolerance above target"],
    [100, 20, 110, true, "1/2 of tolerance above target"],
    [100, 20, 115, true, "3/4 of tolerance above target"],
    [100, 20, 120, true, "at max tolerance"],
    [100, 20, 130, false, "exceed max tolerance"],
    [100, 20, 95, true, "1/4 of tolerance below target"],
    [-100, 20, -95, true, "1/4 of tolerance above target (negative numbers)"],
    [-100, 20, -105, true, "1/4 of tolerance below target (negative numbers)"],
    [100, 20, 80, true, "at min tolerance"],
    [100, 20, 79, false, "below min tolerance"],
    [100, 20, 121, false, "above max tolerance"],
  ])(
    "isAmountWithinTolerancePercent(target: %s, tolerancePercent: %s, value: %s) = %s (%s)",
    (target, tolerancePercent, value, expected) => {
      expect(isAmountWithinTolerancePercent({ target, value, tolerancePercent })).toBe(expected);
    },
  );
});
