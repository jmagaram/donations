export type CategoryFilter =
  | { kind: "all" }
  | { kind: "exactMatch"; category: string };

export const parseCategoryFilter = (value: string): CategoryFilter => {
  if (value === "all" || value === "") return { kind: "all" };
  return { kind: "exactMatch", category: value };
};

export const stringifyCategoryFilter = (
  filter: CategoryFilter,
): string | undefined => {
  switch (filter.kind) {
    case "all":
      return undefined;
    case "exactMatch":
      return filter.category;
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
