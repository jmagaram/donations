export type SortBy = "name" | "category" | "tax-status";

export type SortByFilter = SortBy;

export const sortByFilterParam = {
  encode(value: SortByFilter) {
    return value;
  },

  decode(value: string) {
    return value as SortByFilter;
  },
};
