import { type DonationsData } from "./types";
import { getUniqueOrgCategories, orgTextMatch } from "./donationsData";
import OrgsView from "./OrgsView";
import { useSearchParams } from "react-router-dom";
import { useSearchParam } from "./useSearchParam";
import {
  categoryFilterSearchParam,
  matchesCategoryFilter,
  type CategoryFilter,
} from "./categoryFilter";
import {
  taxStatusParam,
  matchesTaxStatusFilter,
  type TaxStatusFilter,
} from "./taxStatusFilter";
import { useMemo } from "react";
import { type SearchFilter, searchFilterParam } from "./searchFilter";

const getAvailableCategories = (
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

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  const [, setSearchParams] = useSearchParams();

  const [searchFilter, setSearchFilter] = useSearchParam(
    "search",
    searchFilterParam,
  );

  const [categoryFilter, setCategoryFilter] = useSearchParam(
    "category",
    categoryFilterSearchParam,
  );

  const [taxStatusFilter, setTaxStatusFilter] = useSearchParam(
    "tax",
    taxStatusParam,
  );

  const availableCategories = useMemo(
    () => getAvailableCategories(donationsData),
    [donationsData],
  );

  const filteredOrgs = donationsData.orgs
    .filter((org) => {
      const matchesSearchText = orgTextMatch(org, searchFilter ?? "");
      const matchesCategory =
        categoryFilter === undefined
          ? true
          : matchesCategoryFilter(categoryFilter, org.category);
      const matchesTaxStatus = matchesTaxStatusFilter(
        taxStatusFilter,
        org.taxDeductible ?? false,
      );
      return matchesSearchText && matchesCategory && matchesTaxStatus;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const updateSearchFilter = (value: SearchFilter) => {
    const trimmed = value.trim();
    setSearchFilter(trimmed === "" ? undefined : trimmed);
  };

  const updateCategoryFilter = (value: CategoryFilter | undefined) => {
    setCategoryFilter(value);
  };

  const updateTaxStatusFilter = (value: TaxStatusFilter | undefined) => {
    setTaxStatusFilter(value);
  };

  const hasActiveFilters =
    searchFilter !== undefined ||
    categoryFilter !== undefined ||
    (taxStatusFilter !== undefined && taxStatusFilter !== "all");

  return (
    <OrgsView
      orgs={filteredOrgs}
      currentTextFilter={searchFilter ?? ""}
      textFilterChanged={updateSearchFilter}
      categoryFilter={categoryFilter}
      availableCategories={availableCategories}
      categoryFilterChanged={updateCategoryFilter}
      taxStatusFilter={taxStatusFilter}
      taxStatusFilterChanged={updateTaxStatusFilter}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default OrgsContainer;
