import { type DonationsData } from "./donationsData";
import { fuzzyOrgSearch } from "./donationsData";
import OrgsView from "./OrgsView";
import { useSearchParams } from "react-router-dom";
import { useSearchParam } from "./useSearchParam";
import {
  categoryFilterSearchParam,
  matchesCategoryFilter,
  type CategoryFilter,
  getAvailableCategories,
} from "./categoryFilter";
import {
  taxStatusParam,
  matchesTaxStatusFilter,
  type TaxStatusFilter,
} from "./taxStatusFilter";
import { useMemo } from "react";
import { type SearchFilter, searchFilterParam } from "./searchFilter";

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


  let filteredOrgs = donationsData.orgs;

  if (categoryFilter !== undefined) {
    filteredOrgs = filteredOrgs.filter((org) =>
      matchesCategoryFilter(categoryFilter, org.category),
    );
  }
  if (taxStatusFilter !== undefined) {
    filteredOrgs = filteredOrgs.filter((org) =>
      matchesTaxStatusFilter(taxStatusFilter, org.taxDeductible ?? false),
    );
  }
  if (searchFilter !== undefined && searchFilter.trim() !== "") {
    filteredOrgs = fuzzyOrgSearch(filteredOrgs, searchFilter);
  }

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const updateSearchFilter = (value: SearchFilter) => {
    // const trimmed = value.trim();
    const trimmed = value;
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
