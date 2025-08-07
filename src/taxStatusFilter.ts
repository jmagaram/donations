import type { UrlParam } from "./urlParam";

export type TaxStatusFilter =
  | { kind: "all" }
  | { kind: "charity" }
  | { kind: "notTaxDeductible" };

export const taxStatusFilterParam: UrlParam<TaxStatusFilter> = {
  parse: (value: string | undefined): TaxStatusFilter => {
    if (value === undefined || value === "") return { kind: "all" };

    switch (value) {
      case "all":
        return { kind: "all" };
      case "charity":
        return { kind: "charity" };
      case "notTaxDeductible":
        return { kind: "notTaxDeductible" };
      default:
        return { kind: "all" };
    }
  },

  encode: (value: TaxStatusFilter): string | undefined => {
    switch (value.kind) {
      case "all":
        return undefined;
      case "charity":
        return "charity";
      case "notTaxDeductible":
        return "notTaxDeductible";
    }
  },
};

export const matchesTaxStatusFilter = (
  filter: TaxStatusFilter | undefined,
  taxDeductible: boolean,
): boolean => {
  if (filter === undefined) return true;
  switch (filter.kind) {
    case "all":
      return true;
    case "charity":
      return taxDeductible;
    case "notTaxDeductible":
      return !taxDeductible;
  }
};

export const isTaxStatusFiltered = (filter: TaxStatusFilter): boolean => {
  return filter.kind !== "all";
};
