import { type DonationsData } from "./types";
import { getUniqueOrgCategories, orgTextMatch } from "./donationsData";
import OrgsView from "./OrgsView";
import { useSearchParams } from "react-router-dom";
import { useUrlParamValue } from "./urlParam";
import { categoryFilterParam, matchesCategoryFilter } from "./categoryFilter";
import {
  taxStatusFilterParam,
  matchesTaxStatusFilter,
} from "./taxStatusFilter";

const NO_FILTER = "__no_filter__";

const makeCategoryFilterOptions = (
  donationsData: DonationsData,
  currentUrlCategory?: string,
) => {
  const options = [{ value: NO_FILTER, label: "All categories" }];
  const uniqueCategories = new Set(getUniqueOrgCategories(donationsData));
  if (currentUrlCategory) {
    uniqueCategories.add(currentUrlCategory);
  }
  const sortedCategories = Array.from(uniqueCategories).sort();
  sortedCategories.forEach((category) => {
    const categoryFilter = { kind: "exactMatch" as const, category };
    const encodedValue = categoryFilterParam.encode(categoryFilter);
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

  const currentUrlCategory =
    categoryFilter?.kind === "exactMatch" ? categoryFilter.category : undefined;

  const categoryFilterOptions = makeCategoryFilterOptions(
    donationsData,
    currentUrlCategory,
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
      const matchesCategory = matchesCategoryFilter(
        categoryFilter,
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
    const newParams = new URLSearchParams(searchParams);
    const encoded = categoryFilterParam.encode(
      categoryFilter ?? { kind: "all" },
    );
    if (encoded) {
      newParams.set("category", encoded);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams);
  };

  const updateTaxStatusFilter = (value: string) => {
    const taxStatusFilter =
      value === NO_FILTER ? undefined : taxStatusFilterParam.parse(value);
    const newParams = new URLSearchParams(searchParams);
    const encoded = taxStatusFilterParam.encode(
      taxStatusFilter ?? { kind: "all" },
    );
    if (encoded) {
      newParams.set("tax", encoded);
    } else {
      newParams.delete("tax");
    }
    setSearchParams(newParams);
  };

  const hasActiveFilters =
    searchFilter !== undefined ||
    (categoryFilter !== undefined && categoryFilter.kind !== "all") ||
    (taxStatusFilter !== undefined && taxStatusFilter.kind !== "all");

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
