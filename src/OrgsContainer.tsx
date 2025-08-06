import { type DonationsData } from "./types";
import { orgTextMatch, getUniqueOrgCategories } from "./donationsData";
import OrgsView from "./OrgsView";
import { useUrlParam } from "./useUrlParam";
import {
  type CategoryFilter,
  parseCategoryFilter,
  stringifyCategoryFilter,
  matchesCategoryFilter,
} from "./categoryFilter";

const generateCategoryFilterOptions = (donationsData: DonationsData) => {
  const options = [{ value: "", label: "All categories" }];
  const uniqueCategories = Array.from(
    getUniqueOrgCategories(donationsData),
  ).sort();
  uniqueCategories.forEach((category) => {
    options.push({ value: category, label: category });
  });
  return options;
};

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  const [searchFilter, updateSearchFilter, resetSearchFilter] = useUrlParam({
    paramName: "search",
    parseFromString: (value) => value,
    defaultValue: "",
    noFilterValue: "",
    stringifyValue: (value) => (value === "" ? undefined : value),
  });

  const [categoryFilter, updateCategoryFilter, resetCategoryFilter] =
    useUrlParam<CategoryFilter>({
      paramName: "category",
      parseFromString: parseCategoryFilter,
      defaultValue: { kind: "all" },
      noFilterValue: { kind: "all" },
      stringifyValue: stringifyCategoryFilter,
    });

  const categoryFilterOptions = generateCategoryFilterOptions(donationsData);

  const availableCategories = Array.from(getUniqueOrgCategories(donationsData));
  if (
    categoryFilter.kind === "exactMatch" &&
    !availableCategories.includes(categoryFilter.category)
  ) {
    categoryFilterOptions.push({
      value: categoryFilter.category,
      label: categoryFilter.category,
    });
    categoryFilterOptions.sort((a, b) => {
      if (a.value === "") return -1;
      if (b.value === "") return 1;
      return a.label.localeCompare(b.label);
    });
  }

  const filteredOrgs = donationsData.orgs
    .filter((org) => {
      const matchesText = orgTextMatch(org, searchFilter);
      const matchesCategory = matchesCategoryFilter(
        org.category,
        categoryFilter,
      );
      return matchesText && matchesCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleClearFilters = () => {
    resetSearchFilter();
    resetCategoryFilter();
  };

  const hasActiveFilters = searchFilter !== "" || categoryFilter.kind !== "all";

  return (
    <OrgsView
      orgs={filteredOrgs}
      currentTextFilter={searchFilter}
      textFilterChanged={updateSearchFilter}
      categoryFilter={categoryFilter}
      categoryFilterChanged={updateCategoryFilter}
      categoryFilterOptions={categoryFilterOptions}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default OrgsContainer;
