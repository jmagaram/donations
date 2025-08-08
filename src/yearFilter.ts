import type { SearchParam } from "./useSearchParam";

export type YearFilter =
  | { kind: "all" }
  | { kind: "current" }
  | { kind: "previous" }
  | { kind: "last"; count: number }
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
      return { kind: "last", count: 2 };
    case "last3":
      return { kind: "last", count: 3 };
    case "last4":
      return { kind: "last", count: 4 };
    case "last5":
      return { kind: "last", count: 5 };
    default: {
      const lastMatch = normalized.match(/^last(\d+)$/);
      if (lastMatch) {
        const count = parseInt(lastMatch[1]);
        return { kind: "last", count };
      }
      if (normalized.match(/^[0-9]{4}$/)) {
        return { kind: "other", value: parseInt(value) };
      }
      return undefined;
    }
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
    case "last":
      return `last${filter.count}`;
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
    case "last":
      return [currentYear - yearFilter.count + 1, currentYear];
    case "other":
      return [yearFilter.value, yearFilter.value];
  }
};

export const yearFilterSearchParam: SearchParam<YearFilter> = {
  parse: parseYearFilter,
  encode: encode,
};

export const getYearDisplayLabel = (
  yearFilter: YearFilter | undefined,
): string => {
  if (yearFilter === undefined) return "All years";
  switch (yearFilter.kind) {
    case "all":
      return "All years";
    case "current":
      return "Current year";
    case "previous":
      return "Previous year";
    case "last":
      return `Last ${yearFilter.count} years`;
    case "other":
      return yearFilter.value.toString();
  }
};
