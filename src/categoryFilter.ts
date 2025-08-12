import type { SearchParam } from "./useSearchParam";
import type { DonationsData } from "./donationsData";
import { getUniqueOrgCategories } from "./donationsData";

// Defines a category filter, such as "Healthcare" or "Politics". It is possible
// to find organizations and donations that do not have an assigned category by
// setting the filter value to the empty string or whitespace; this is
// distinct from the absence of a filter.
export type CategoryFilter = string;

export const categoryFilterSearchParam: SearchParam<CategoryFilter> = {
  parse: (value: string | undefined) => value?.trim(),
  encode: (value: CategoryFilter) => value.trim(),
};

export const matchesCategoryFilter = (
  filter: CategoryFilter,
  category: string | null | undefined,
): boolean => {
  const categoryNormalized = category?.trim().toLocaleLowerCase() ?? "";
  const filterNormalized = filter.trim().toLocaleLowerCase();
  return filterNormalized === categoryNormalized;
};

export const getAvailableCategories = (
  donationsData: DonationsData,
): CategoryFilter[] => {
  const uniqueCategories = new Set(getUniqueOrgCategories(donationsData));
  const missingCategory = categoryFilterSearchParam.encode("");
  const categories: CategoryFilter[] =
    missingCategory !== undefined ? [missingCategory] : [];
  const sortedCategories = Array.from(uniqueCategories)
    .filter((i) => i.trim().length > 0)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  categories.push(...sortedCategories);
  return categories;
};
