import type { UrlParam } from "./useUrlParam";

export type YearFilter =
  | { kind: "all" }
  | { kind: "current" }
  | { kind: "previous" }
  | { kind: "last2" }
  | { kind: "last3" }
  | { kind: "last4" }
  | { kind: "last5" }
  | { kind: "other"; value: number };

const parseYearFilter = (value: string | undefined): YearFilter | undefined => {
  if (value === undefined) return undefined;
  const normalized = value.trim().toLocaleLowerCase();
  switch (normalized) {
    case "all":
      return { kind: "all" };
    case "current":
      return { kind: "current" };
    case "previous":
      return { kind: "previous" };
    case "last2":
      return { kind: "last2" };
    case "last3":
      return { kind: "last3" };
    case "last4":
      return { kind: "last4" };
    case "last5":
      return { kind: "last5" };
    default:
      if (normalized.match(/^[0-9]{4}$/)) {
        return { kind: "other", value: parseInt(value) };
      }
      return undefined;
  }
};

const encode = (filter: YearFilter): string | undefined => {
  switch (filter.kind) {
    case "all":
      return undefined;
    case "current":
      return "current";
    case "previous":
      return "previous";
    case "last2":
      return "last2";
    case "last3":
      return "last3";
    case "last4":
      return "last4";
    case "last5":
      return "last5";
    case "other":
      return filter.value.toString();
  }
};

export const getYearRange = ({
  yearFilter,
  minYear,
  maxYear,
  currentYear,
}: {
  yearFilter: YearFilter;
  minYear: number;
  maxYear: number;
  currentYear: number;
}): [number, number] => {
  switch (yearFilter.kind) {
    case "all":
      return [minYear, maxYear];
    case "current":
      return [currentYear, currentYear];
    case "previous":
      return [currentYear - 1, currentYear - 1];
    case "last2":
      return [currentYear - 1, currentYear];
    case "last3":
      return [currentYear - 2, currentYear];
    case "last4":
      return [currentYear - 3, currentYear];
    case "last5":
      return [currentYear - 4, currentYear];
    case "other":
      return [yearFilter.value, yearFilter.value];
  }
};

export const yearFilterParam: UrlParam<YearFilter> = {
  parse: parseYearFilter,
  encode: encode,
};
