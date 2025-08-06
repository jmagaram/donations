export type AmountFilter =
  | { kind: "all" }
  | { kind: "moreThan"; min: number }
  | { kind: "lessThan"; max: number }
  | { kind: "between"; min: number; max: number };

export const parseAmountFilter = (str: string): AmountFilter | undefined => {
  if (str === "all") return { kind: "all" };

  const parts = str.split("_");
  const type = parts[0];

  switch (type) {
    case "moreThan": {
      if (parts.length !== 2) return undefined;
      const min = parseFloat(parts[1]);
      return isNaN(min) ? undefined : { kind: "moreThan", min };
    }
    case "lessThan": {
      if (parts.length !== 2) return undefined;
      const max = parseFloat(parts[1]);
      return isNaN(max) ? undefined : { kind: "lessThan", max };
    }
    case "between": {
      if (parts.length !== 3) return undefined;
      const min = parseFloat(parts[1]);
      const max = parseFloat(parts[2]);
      return isNaN(min) || isNaN(max)
        ? undefined
        : { kind: "between", min, max };
    }
    default:
      return undefined;
  }
};

export const stringifyAmountFilter = (filter: AmountFilter): string | undefined => {
  switch (filter.kind) {
    case "all":
      return undefined;
    case "moreThan":
      return `moreThan_${filter.min}`;
    case "lessThan":
      return `lessThan_${filter.max}`;
    case "between":
      return `between_${filter.min}_${filter.max}`;
  }
};

export const areAmountFiltersEqual = (a: AmountFilter, b: AmountFilter): boolean => {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case "all":
      return true;
    case "moreThan":
      return a.min === (b as typeof a).min;
    case "lessThan":
      return a.max === (b as typeof a).max;
    case "between":
      return a.min === (b as typeof a).min && a.max === (b as typeof a).max;
  }
};