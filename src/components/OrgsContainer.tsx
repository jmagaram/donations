import { type DonationsData } from "../donationsData";
import { fuzzyOrgSearch } from "../fuzzy";
import OrgsView from "./OrgsView";
import { useSearchParams } from "react-router-dom";
import { useSearchParam } from "../hooks/useSearchParam";
import { type SearchFilter, searchFilterParam } from "../searchFilter";
import { type SortByFilter, sortByFilterParam } from "../sortByFilter";

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  const [, setSearchParams] = useSearchParams();

  const [searchFilter, setSearchFilter] = useSearchParam(
    "search",
    searchFilterParam
  );

  const [sortByFilter, setSortByFilter] = useSearchParam(
    "sort",
    sortByFilterParam
  );

  let filteredOrgs = donationsData.orgs;

  if (searchFilter !== undefined && searchFilter.trim() !== "") {
    filteredOrgs = fuzzyOrgSearch(filteredOrgs, searchFilter);
  } else {
    // Apply sorting only when no search filter is active
    if (sortByFilter === "name") {
      filteredOrgs.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortByFilter === "category") {
      filteredOrgs.sort((a, b) => {
        if (a.category && b.category) {
          if (a.category < b.category) return -1;
          if (a.category > b.category) return 1;
        }
        return a.name.localeCompare(b.name);
      });
    } else if (sortByFilter === "tax-status") {
      filteredOrgs.sort((a, b) => {
        const aStatus = a.taxDeductible ? "Deductible" : "Not Deductible";
        const bStatus = b.taxDeductible ? "Deductible" : "Not Deductible";
        if (aStatus < bStatus) return -1;
        if (aStatus > bStatus) return 1;
        return a.name.localeCompare(b.name);
      });
    }
  }

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const updateSearchFilter = (value: SearchFilter) => {
    const trimmed = value;
    setSearchFilter(trimmed === "" ? undefined : trimmed);
  };

  const updateSortByFilter = (value: SortByFilter | undefined) => {
    setSortByFilter(value);
  };

  const hasActiveFilters = searchFilter !== undefined;

  return (
    <OrgsView
      orgs={filteredOrgs}
      currentTextFilter={searchFilter ?? ""}
      textFilterChanged={updateSearchFilter}
      sortByFilter={sortByFilter}
      sortByFilterChanged={updateSortByFilter}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default OrgsContainer;
