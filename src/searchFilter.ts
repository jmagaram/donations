import type { SearchParam } from "./useSearchParam";

export type SearchFilter = string;

const parse = (value: string | undefined): SearchFilter | undefined => {
  return value?.trim();
};

const encode = (value: SearchFilter): string | undefined => {
  return value?.trim();
};

export const searchFilterParam: SearchParam<SearchFilter> = {
  parse,
  encode,
};

export const matchesText = (filter: SearchFilter | undefined, text: string) => {
  if (filter === undefined) return true;
  if (filter === "") return true;
  return text
    .trim()
    .toLocaleLowerCase()
    .includes(filter.trim().toLocaleLowerCase());
};
