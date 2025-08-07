import { type DonationsData } from "./types";
import { getUniqueOrgCategories, orgTextMatch } from "./donationsData";
import OrgsView from "./OrgsView";
import { useSearchParams } from "react-router-dom";
import { useUrlParamValue } from "./useUrlParam";
import { categoryFilterParam, matchesCategoryFilter } from "./categoryFilter";
import {
  taxStatusFilterParam,
  matchesTaxStatusFilter,
} from "./taxStatusFilter";
import { useMemo } from "react";

const NO_FILTER = "__no_filter__";
const NO_CATEGORY = "";

const makeCategoryFilterOptions = (
  donationsData: DonationsData,
  currentUrlCategory?: string,
) => {
  const options = [
    { value: NO_FILTER, label: "All categories" },
    { value: NO_CATEGORY, label: "No category" },
  ];
  const uniqueCategories = new Set(getUniqueOrgCategories(donationsData));
  if (currentUrlCategory) {
    uniqueCategories.add(currentUrlCategory);
  }
  const sortedCategories = Array.from(uniqueCategories)
    .filter((i) => i.trim().length > 0)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  sortedCategories.forEach((category) => {
    const encodedValue = categoryFilterParam.encode(category);
    if (encodedValue) {
      options.push({
        value: encodedValue,
        label: category,
      });
    }
  });
  return options;
};

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFilter = useUrlParamValue("search", {
    parse: (value: string | undefined) => {
      if (value === undefined || value.trim() === "") {
        return undefined;
      }
      return value;
    },
  });

  const categoryFilter = useUrlParamValue("category", categoryFilterParam);

  const taxStatusFilter = useUrlParamValue("tax", taxStatusFilterParam);

  const categoryFilterOptions = useMemo(
    () =>
      makeCategoryFilterOptions(
        donationsData,
        categoryFilter === NO_CATEGORY || categoryFilter === NO_FILTER
          ? undefined
          : categoryFilter,
      ),
    [donationsData, categoryFilter],
  );

  const currentCategoryValue = categoryFilter
    ? (categoryFilterParam.encode(categoryFilter) ?? NO_FILTER)
    : NO_FILTER;

  const currentTaxStatusValue = taxStatusFilter
    ? (taxStatusFilterParam.encode(taxStatusFilter) ?? NO_FILTER)
    : NO_FILTER;

  const filteredOrgs = donationsData.orgs
    .filter((org) => {
      const matchesSearchText = orgTextMatch(org, searchFilter ?? "");
      const matchesCategory =
        categoryFilter === undefined
          ? true
          : matchesCategoryFilter(
              categoryFilter === NO_CATEGORY ? "" : categoryFilter,
              org.category,
            );
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

  const updateSearchFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed === "") {
      newParams.delete("search");
    } else {
      newParams.set("search", trimmed);
    }
    setSearchParams(newParams);
  };

  const updateCategoryFilter = (value: string) => {
    const categoryFilter =
      value === NO_FILTER ? undefined : categoryFilterParam.parse(value);
    const modifiedParams = new URLSearchParams(searchParams);
    if (categoryFilter !== undefined) {
      const encoded = categoryFilterParam.encode(categoryFilter);
      if (encoded !== undefined) {
        modifiedParams.set("category", encoded);
      } else {
        modifiedParams.delete("category");
      }
    } else {
      modifiedParams.delete("category");
    }
    setSearchParams(modifiedParams);
  };

  const updateTaxStatusFilter = (value: string) => {
    const taxStatusFilter =
      value === NO_FILTER ? undefined : taxStatusFilterParam.parse(value);
    const newParams = new URLSearchParams(searchParams);
    const encoded = taxStatusFilterParam.encode(taxStatusFilter ?? "all");
    if (encoded) {
      newParams.set("tax", encoded);
    } else {
      newParams.delete("tax");
    }
    setSearchParams(newParams);
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
      currentCategoryValue={currentCategoryValue}
      categoryFilterChanged={updateCategoryFilter}
      categoryFilterOptions={categoryFilterOptions}
      currentTaxStatusValue={currentTaxStatusValue}
      taxStatusFilterChanged={updateTaxStatusFilter}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default OrgsContainer;
