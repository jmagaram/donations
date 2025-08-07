export const formatUSD = (
  amount: number,
  pennies: "showPennies" | "hidePennies" = "showPennies",
): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: pennies === "hidePennies" ? 0 : 2,
  }).format(amount);
