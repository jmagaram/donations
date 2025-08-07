export type DonationTypeFilter =
  | { kind: "all" }
  | { kind: "paid" }
  | { kind: "pledge" }
  | { kind: "paidAndPledge" }
  | { kind: "unknown" }
  | { kind: "idea" };

export const parseDonationTypeFilter = (value: string): DonationTypeFilter => {
  switch (value) {
    case "all":
      return { kind: "all" };
    case "paid":
      return { kind: "paid" };
    case "pledge":
      return { kind: "pledge" };
    case "paidAndPledge":
      return { kind: "paidAndPledge" };
    case "unknown":
      return { kind: "unknown" };
    case "idea":
      return { kind: "idea" };
    default:
      return { kind: "all" };
  }
};

export const stringifyDonationTypeFilter = (filter: DonationTypeFilter): string | undefined => {
  switch (filter.kind) {
    case "all":
      return undefined;
    case "paid":
      return "paid";
    case "pledge":
      return "pledge";
    case "paidAndPledge":
      return "paidAndPledge";
    case "unknown":
      return "unknown";
    case "idea":
      return "idea";
  }
};

export const matchesDonationTypeFilter = (
  donationKind: string,
  filter: DonationTypeFilter
): boolean => {
  switch (filter.kind) {
    case "all":
      return true;
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
  }
};

export const areDonationTypeFiltersEqual = (a: DonationTypeFilter, b: DonationTypeFilter): boolean => {
  return a.kind === b.kind;
};