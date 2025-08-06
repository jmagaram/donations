export type YearFilter =
  | { kind: "all" }
  | { kind: "current" }
  | { kind: "previous" }
  | { kind: "last2" }
  | { kind: "other"; value: number };

export function parseYearFilter(value: string): YearFilter {
  switch (value) {
    case "all":
      return { kind: "all" };
    case "current":
      return { kind: "current" };
    case "previous":
      return { kind: "previous" };
    case "last2":
      return { kind: "last2" };
    default:
      if (value.match(/^[0-9]{4}$/)) {
        return { kind: "other", value: parseInt(value) };
      }
      return { kind: "all" };
  }
}

export function stringifyYearFilter(filter: YearFilter): string | undefined {
  switch (filter.kind) {
    case "all":
      return undefined;
    case "current":
      return "current";
    case "previous":
      return "previous";
    case "last2":
      return "last2";
    case "other":
      return filter.value.toString();
  }
}

export function getYearRange({
  yearFilter,
  minYear,
  maxYear,
  currentYear,
}: {
  yearFilter: YearFilter;
  minYear: number;
  maxYear: number;
  currentYear: number;
}): [number, number] {
  switch (yearFilter.kind) {
    case "all":
      return [minYear, maxYear];
    case "current":
      return [currentYear, currentYear];
    case "previous":
      return [currentYear - 1, currentYear - 1];
    case "last2":
      return [currentYear - 1, currentYear];
    case "other":
      return [yearFilter.value, yearFilter.value];
  }
}
