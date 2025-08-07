export type CategoryFilter =
  | { kind: "all" }
  | { kind: "exactMatch"; category: string };

export const parseCategoryFilter = (value: string): CategoryFilter => {
  if (value === "all" || value === "") return { kind: "all" };
  if (value.startsWith("exactMatch_")) {
    const category = value.substring("exactMatch_".length);
    return { kind: "exactMatch", category };
  }
  return { kind: "all" };
};

export const stringifyCategoryFilter = (
  filter: CategoryFilter,
): string | undefined => {
  switch (filter.kind) {
    case "all":
      return undefined;
    case "exactMatch":
      return `exactMatch_${filter.category}`;
  }
};

export const stringifyCategoryFilterForUI = (
  filter: CategoryFilter,
): string => {
  switch (filter.kind) {
    case "all":
      return "all";
    case "exactMatch":
      return `exactMatch_${filter.category}`;
  }
};

export const matchesCategoryFilter = (
  category: string | undefined,
  filter: CategoryFilter,
): boolean => {
  switch (filter.kind) {
    case "all":
      return true;
    case "exactMatch":
      return category === filter.category;
  }
};

export const areCategoryFiltersEqual = (a: CategoryFilter, b: CategoryFilter): boolean => {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case "all":
      return true;
    case "exactMatch":
      return a.category === (b as typeof a).category;
  }
};
