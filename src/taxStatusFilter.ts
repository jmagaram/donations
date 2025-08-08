import type { SearchParam } from "./useSearchParam";

export type TaxStatusFilter = "all" | "charity" | "notTaxDeductible";

const NO_FILTER = "__all_tax_status__";

const parse = (value: string | undefined): TaxStatusFilter => {
  if (value === undefined || value === "" || value === NO_FILTER) return "all";

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
};

const encode = (value: TaxStatusFilter): string | undefined => {
  switch (value) {
    case "all":
      return undefined;
    case "charity":
      return "charity";
    case "notTaxDeductible":
      return "notTaxDeductible";
  }
};

export const displayLabel = (value: TaxStatusFilter) => {
  switch (value) {
    case "all":
      return "All tax status";
    case "charity":
      return "Charity";
    case "notTaxDeductible":
      return "Not tax-deductible";
  }
};

export const makeOption = (value: TaxStatusFilter) => {
  return { label: displayLabel(value), value: encode(value) ?? NO_FILTER };
};

const valid: TaxStatusFilter[] = ["all", "charity", "notTaxDeductible"];

export const taxStatusChoices = valid.map(makeOption);

export const taxStatusParam: SearchParam<TaxStatusFilter> = {
  parse: parse,
  encode: encode,
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
