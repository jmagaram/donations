import { useSearchParams } from "react-router-dom";
import { type DonationsData } from "./types";
import { textMatch } from "./organization";
import OrgsView from "./OrgsView";

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state from URL parameters
  const textFilter = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "all";

  // URL update functions
  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "all") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const updateTextFilter = (newFilter: string) => {
    updateSearchParams({ search: newFilter || undefined });
  };

  const updateCategoryFilter = (newCategory: string) => {
    updateSearchParams({ category: newCategory === "all" ? undefined : newCategory });
  };

  // Get unique categories from all organizations
  const availableCategories = Array.from(
    new Set(
      donationsData.orgs
        .map(org => org.category)
        .filter(Boolean)
        .filter(category => category.trim().length > 0)
    )
  ).sort();

  // Add URL category if it doesn't exist in available categories
  const categoriesForDropdown = [...availableCategories];
  if (categoryFilter !== "all" && !availableCategories.includes(categoryFilter)) {
    categoriesForDropdown.push(categoryFilter);
    categoriesForDropdown.sort();
  }

  const filteredOrgs = donationsData.orgs
    .filter((org) => {
      const matchesText = textMatch(org, textFilter);
      const matchesCategory = categoryFilter === "all" || 
        (org.category === categoryFilter);
      return matchesText && matchesCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = textFilter !== "" || categoryFilter !== "all";

  return (
    <OrgsView
      orgs={filteredOrgs}
      currentTextFilter={textFilter}
      textFilterChanged={updateTextFilter}
      currentCategoryFilter={categoryFilter}
      categoryFilterChanged={updateCategoryFilter}
      availableCategories={categoriesForDropdown}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default OrgsContainer;
