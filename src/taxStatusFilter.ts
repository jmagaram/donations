import type { UrlParam } from "./urlParam";

export type TaxStatusFilter = "all" | "charity" | "notTaxDeductible";

export const taxStatusFilterParam: UrlParam<TaxStatusFilter> = {
  parse: (value: string | undefined): TaxStatusFilter => {
    if (value === undefined || value === "") return "all";

    switch (value) {
      case "all":
        return "all";
      case "charity":
        return "charity";
      case "notTaxDeductible":
        return "notTaxDeductible";
      default:
        return "all";
    }
  },

  encode: (value: TaxStatusFilter): string | undefined => {
    switch (value) {
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
  switch (filter) {
    case "all":
      return true;
    case "charity":
      return taxDeductible;
    case "notTaxDeductible":
      return !taxDeductible;
  }
};

export const isTaxStatusFiltered = (filter: TaxStatusFilter): boolean => {
  return filter !== "all";
};
