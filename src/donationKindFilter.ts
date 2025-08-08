import type { SearchParam } from "./useSearchParam";

export type PaymentKindFilterParam =
  | "all"
  | "paid"
  | "pledge"
  | "paidAndPledge"
  | "unknown"
  | "idea";

const NO_FILTER = "__all_payment_kind__";

const validValues: PaymentKindFilterParam[] = [
  "all",
  "paid",
  "pledge",
  "paidAndPledge",
  "unknown",
  "idea",
];

const parse = (value: string | undefined): PaymentKindFilterParam => {
  if (value === undefined || value === "" || value === NO_FILTER) return "all";

  const normalized = value.trim() as PaymentKindFilterParam;
  return validValues.includes(normalized) ? normalized : "all";
};

const encode = (value: PaymentKindFilterParam): string | undefined => {
  return value === "all" ? undefined : value;
};

export const displayLabel = (value: PaymentKindFilterParam) => {
  switch (value) {
    case "all":
      return "Any kind";
    case "paid":
      return "Paid";
    case "pledge":
      return "Pledge";
    case "paidAndPledge":
      return "Paid and pledge";
    case "unknown":
      return "Unknown";
    case "idea":
      return "Idea";
  }
};

export const makeOption = (value: PaymentKindFilterParam) => {
  return { label: displayLabel(value), value: encode(value) ?? NO_FILTER };
};

export const paymentKindChoices = validValues.map(makeOption);

export const paymentKindParam: SearchParam<PaymentKindFilterParam> = {
  parse: parse,
  encode: encode,
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
