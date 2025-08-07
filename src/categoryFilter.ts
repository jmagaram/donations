import type { UrlParam } from "./urlParam";

export type CategoryFilter =
  | { kind: "all" }
  | { kind: "exactMatch"; category: string };

export const categoryFilterParam: UrlParam<CategoryFilter> = {
  parse: (value: string | undefined): CategoryFilter => {
    if (value === undefined || value === "" || value === "all")
      return { kind: "all" };

    if (value.startsWith("exactMatch_")) {
      const category = value.substring("exactMatch_".length);
      return { kind: "exactMatch", category };
    }

    return { kind: "all" };
  },

  encode: (value: CategoryFilter): string | undefined => {
    switch (value.kind) {
      case "all":
        return undefined;
      case "exactMatch":
        return `exactMatch_${value.category}`;
    }
  },
};

export const matchesCategoryFilter = (
  filter: CategoryFilter | undefined,
  category: string | undefined,
): boolean => {
  if (filter === undefined) return true;
  switch (filter.kind) {
    case "all":
      return true;
    case "exactMatch":
      return category === filter.category;
  }
};

export const isCategoryFiltered = (filter: CategoryFilter) => {
  return filter.kind !== "all";
};
