import { type DonationsData } from "./types";
import { textMatch } from "./organization";
import OrgsView from "./OrgsView";
import { useUrlParam } from "./useUrlParam";

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  const [searchFilter, updateSearchFilter] = useUrlParam({
    paramName: "search",
    parseFromString: (value) => value,
    defaultValue: "",
    noFilterValue: "",
    stringifyValue: (value) => value || undefined,
  });

  const [categoryFilter, updateCategoryFilter] = useUrlParam({
    paramName: "category",
    parseFromString: (value) => value,
    defaultValue: "all",
    noFilterValue: "all",
    stringifyValue: (value) => (value === "all" ? undefined : value),
  });

  const availableCategories = Array.from(
    new Set(
      donationsData.orgs
        .map((org) => org.category)
        .filter(
          (cat): cat is string =>
            typeof cat === "string" && cat.trim().length > 0,
        ),
    ),
  ).sort();

  // Add URL category if it doesn't exist in available categories
  const categoriesForDropdown = [...availableCategories];
  if (
    categoryFilter !== "all" &&
    !availableCategories.includes(categoryFilter)
  ) {
    categoriesForDropdown.push(categoryFilter);
    categoriesForDropdown.sort();
  }

  const filteredOrgs = donationsData.orgs
    .filter((org) => {
      const matchesText = textMatch(org, searchFilter);
      const matchesCategory =
        categoryFilter === "all" || org.category === categoryFilter;
      return matchesText && matchesCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleClearFilters = () => {
    updateSearchFilter("");
    updateCategoryFilter("all");
  };

  const hasActiveFilters = searchFilter !== "" || categoryFilter !== "all";

  return (
    <OrgsView
      orgs={filteredOrgs}
      currentTextFilter={searchFilter}
      textFilterChanged={updateSearchFilter}
      currentCategoryFilter={categoryFilter}
      categoryFilterChanged={updateCategoryFilter}
      availableCategories={categoriesForDropdown}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default OrgsContainer;
