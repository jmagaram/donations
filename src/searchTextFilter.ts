import type { UrlParam } from "./useUrlParam";

export type SearchTextFilter =
  | { kind: "all" }
  | { kind: "includes"; text: string };

export const searchTextFilter: UrlParam<SearchTextFilter> = {
  parse: (value: string | undefined): SearchTextFilter => {
    if (value === undefined || value === "" || value === "all")
      return { kind: "all" };

    if (value.startsWith("includes_")) {
      const includes = value.substring("exactMatch_".length);
      return { kind: "includes", text: includes };
    }

    return { kind: "all" };
  },

  encode: (value: SearchTextFilter): string | undefined => {
    switch (value.kind) {
      case "all":
        return undefined;
      case "includes":
        return `includes_${value.text}`;
    }
  },
};

export const matchesText = (
  filter: SearchTextFilter | undefined,
  text: string,
) => {
  if (filter === undefined) return true;
  if (filter.kind === "all") return true;
  return text
    .trim()
    .toLocaleLowerCase()
    .includes(filter.text.trim().toLocaleLowerCase());
};

// inconsistent behavior on the filter.text.length
export const isSearchTextFiltered = (filter: SearchTextFilter) =>
  filter.kind === "includes" && filter.text.length > 0;
