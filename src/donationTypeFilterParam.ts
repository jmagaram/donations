import type { UrlParam } from "./urlParam";

export type PaymentKindFilterParam =
  | "all"
  | "paid"
  | "pledge"
  | "paidAndPledge"
  | "unknown"
  | "idea";

const validValues: PaymentKindFilterParam[] = [
  "all",
  "paid",
  "pledge",
  "paidAndPledge",
  "unknown",
  "idea",
];

export const paymentKindUrlParam: UrlParam<PaymentKindFilterParam> = {
  parse: (value) => {
    if (!value) return undefined;
    const normalized = value.trim().toLowerCase() as PaymentKindFilterParam;
    if (normalized === "all") return undefined;
    return validValues.includes(normalized) ? normalized : undefined;
  },

  encode: (value) => (value === "all" ? undefined : value),
};

export const matchesPaymentKindFilter = (
  donationKind: string,
  filter: PaymentKindFilterParam | undefined,
): boolean => {
  if (!filter || filter === "all") return true;

  switch (filter) {
    case "paid":
      return donationKind === "paid";
    case "pledge":
      return donationKind === "pledge";
    case "paidAndPledge":
      return donationKind === "paid" || donationKind === "pledge";
    case "unknown":
      return donationKind === "unknown";
    case "idea":
      return donationKind === "idea";
    default:
      return false;
  }
};

export const NO_PAYMENT_KIND_FILTER: PaymentKindFilterParam = "all";
