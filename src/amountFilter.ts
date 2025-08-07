import type { UrlParam } from "./useUrlParam";

export type AmountFilter =
  | { kind: "all" }
  | { kind: "moreThan"; min: number }
  | { kind: "lessThan"; max: number }
  | { kind: "between"; min: number; max: number };

const parseAmountFilter = (
  str: string | undefined,
): AmountFilter | undefined => {
  if (str === undefined) return undefined;
  if (str.trim() === "") return undefined;
  if (str.trim().toLocaleLowerCase() === "all") return undefined;

  const parts = str.split("_");
  const type = parts[0];

  switch (type) {
    case "moreThan": {
      if (parts.length !== 2) return { kind: "all" };
      const min = parseFloat(parts[1]);
      return isNaN(min) ? { kind: "all" } : { kind: "moreThan", min };
    }
    case "lessThan": {
      if (parts.length !== 2) return { kind: "all" };
      const max = parseFloat(parts[1]);
      return isNaN(max) ? { kind: "all" } : { kind: "lessThan", max };
    }
    case "between": {
      if (parts.length !== 3) return { kind: "all" };
      const min = parseFloat(parts[1]);
      const max = parseFloat(parts[2]);
      return isNaN(min) || isNaN(max)
        ? { kind: "all" }
        : { kind: "between", min, max };
    }
    default:
      return { kind: "all" };
  }
};

const encode = (filter: AmountFilter): string | undefined => {
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

export const amountFilterParam: UrlParam<AmountFilter> = {
  parse: parseAmountFilter,
  encode: encode,
};
