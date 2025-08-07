export type TaxStatusFilter =
  | { kind: "all" }
  | { kind: "taxDeductible" }
  | { kind: "notTaxDeductible" };

export const parseTaxStatusFilter = (value: string): TaxStatusFilter => {
  switch (value) {
    case "all":
      return { kind: "all" };
    case "taxDeductible":
      return { kind: "taxDeductible" };
    case "notTaxDeductible":
      return { kind: "notTaxDeductible" };
    default:
      return { kind: "all" };
  }
};

export const stringifyTaxStatusFilter = (filter: TaxStatusFilter): string | undefined => {
  switch (filter.kind) {
    case "all":
      return undefined;
    case "taxDeductible":
      return "taxDeductible";
    case "notTaxDeductible":
      return "notTaxDeductible";
  }
};

export const matchesTaxStatusFilter = (
  taxDeductible: boolean,
  filter: TaxStatusFilter
): boolean => {
  switch (filter.kind) {
    case "all":
      return true;
    case "taxDeductible":
      return taxDeductible;
    case "notTaxDeductible":
      return !taxDeductible;
  }
};

export const areTaxStatusFiltersEqual = (a: TaxStatusFilter, b: TaxStatusFilter): boolean => {
  return a.kind === b.kind;
};