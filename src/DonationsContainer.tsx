import { getCurrentYear, compareDatesDesc } from "./date";
import { useMemo } from "react";
import { getDonationYearRange } from "./donationsData";
import { type DonationsData } from "./types";
import DonationsView, { type DonationDisplay } from "./DonationsView";
import { useUrlParam } from "./useUrlParam";
import { useSearchParams } from "react-router-dom";
import {
  getUniqueDonationYears,
  getUniqueOrgCategories,
  matchesYearFilter,
  matchesAmountFilter,
  matchesSearchFilter,
  getOrgName,
} from "./donationsData";
import {
  getYearRange,
  parseYearFilter,
  stringifyYearFilter,
  type YearFilter,
} from "./yearFilter";
import {
  parseAmountFilter,
  stringifyAmountFilter,
  areAmountFiltersEqual,
} from "./amountFilter";
import {
  parseCategoryFilter,
  stringifyCategoryFilter,
  matchesCategoryFilter,
  areCategoryFiltersEqual,
} from "./categoryFilter";
import {
  parseTaxStatusFilter,
  stringifyTaxStatusFilter,
  matchesTaxStatusFilter,
  areTaxStatusFiltersEqual,
} from "./taxStatusFilter";
import {
  parseDonationTypeFilter,
  stringifyDonationTypeFilter,
  matchesDonationTypeFilter,
  areDonationTypeFiltersEqual,
} from "./donationTypeFilter";
import { formatUSD } from "./amount";

const generateYearFilterOptions = (
  donationsData: DonationsData,
  yearFilter: YearFilter,
) => {
  const options = [
    { value: "all", label: "All years" },
    { value: "current", label: "Current year" },
    { value: "previous", label: "Previous year" },
    { value: "last2", label: "Last 2 years" },
  ];

  const uniqueYears = new Set(getUniqueDonationYears(donationsData));

  if (yearFilter.kind === "other") {
    uniqueYears.add(yearFilter.value);
  }

  Array.from(uniqueYears)
    .sort((a, b) => b - a) // Newest first
    .forEach((year) => {
      options.push({ value: year.toString(), label: year.toString() });
    });

  return options;
};

const generateCategoryFilterOptions = (donationsData: DonationsData) => {
  const options = [{ value: "all", label: "Any category" }];
  const uniqueCategories = Array.from(getUniqueOrgCategories(donationsData));
  uniqueCategories.sort(); // Alphabetical order
  uniqueCategories.forEach((category) => {
    options.push({ value: `exactMatch_${category}`, label: category });
  });
  return options;
};

interface DonationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationsContainer = ({ donationsData }: DonationsContainerProps) => {
  const currentYear = getCurrentYear();
  const yearRange = getDonationYearRange(donationsData.donations);
  const minYear = yearRange?.minYear ?? currentYear;
  const maxYear = yearRange?.maxYear ?? currentYear;
  const [, setSearchParams] = useSearchParams();

  const [yearFilter, updateYearFilter] = useUrlParam({
    paramName: "year",
    parseFromString: parseYearFilter,
    defaultValue: { kind: "all" },
    stringifyValue: stringifyYearFilter,
  });

  const [searchFilter, updateSearchFilter] = useUrlParam({
    paramName: "search",
    parseFromString: (value) => value,
    defaultValue: "",
    stringifyValue: (value) => (value === "" ? undefined : value),
  });

  const [categoryFilter, updateCategoryFilter] = useUrlParam({
    paramName: "category",
    parseFromString: parseCategoryFilter,
    defaultValue: { kind: "all" },
    stringifyValue: stringifyCategoryFilter,
    areEqual: areCategoryFiltersEqual,
  });

  const [amountFilter, updateAmountFilter] = useUrlParam({
    paramName: "amount",
    parseFromString: parseAmountFilter,
    defaultValue: { kind: "all" },
    stringifyValue: stringifyAmountFilter,
    areEqual: areAmountFiltersEqual,
  });

  const [taxStatusFilter, updateTaxStatusFilter] = useUrlParam({
    paramName: "tax",
    parseFromString: parseTaxStatusFilter,
    defaultValue: { kind: "all" },
    stringifyValue: stringifyTaxStatusFilter,
    areEqual: areTaxStatusFiltersEqual,
  });

  const [donationTypeFilter, updateDonationTypeFilter] = useUrlParam({
    paramName: "type",
    parseFromString: parseDonationTypeFilter,
    defaultValue: { kind: "all" },
    stringifyValue: stringifyDonationTypeFilter,
    areEqual: areDonationTypeFiltersEqual,
  });

  const categoryFilterOptions = useMemo(
    () => generateCategoryFilterOptions(donationsData),
    [donationsData],
  );

  const yearFilterOptions = useMemo(
    () => generateYearFilterOptions(donationsData, yearFilter),
    [donationsData, yearFilter],
  );

  const [yearFrom, yearTo] = getYearRange({
    yearFilter,
    minYear,
    maxYear,
    currentYear,
  });

  const donations: DonationDisplay[] = [...donationsData.donations]
    .filter((d) => {
      const org = donationsData.orgs.find((o) => o.id === d.orgId);
      return (
        matchesYearFilter(d, yearFrom, yearTo) &&
        matchesAmountFilter(d, amountFilter) &&
        matchesCategoryFilter(org?.category, categoryFilter) &&
        matchesSearchFilter(d, donationsData, searchFilter) &&
        matchesTaxStatusFilter(org?.taxDeductible ?? false, taxStatusFilter) &&
        matchesDonationTypeFilter(d.kind, donationTypeFilter)
      );
    })
    .sort((a, b) => compareDatesDesc(a.date, b.date))
    .map((donation) => {
      return {
        id: donation.id,
        date: donation.date,
        amount: formatUSD(donation.amount, "hidePennies"),
        orgId: donation.orgId,
        orgName: getOrgName(donationsData, donation.orgId),
        kind: donation.kind,
        notes: donation.notes,
        paymentMethod: donation.paymentMethod,
      };
    });

  const handleClearFilters = () => {
    // Clear all filter parameters in one atomic operation
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    searchFilter !== "" ||
    yearFilter.kind !== "all" ||
    amountFilter.kind !== "all" ||
    categoryFilter.kind !== "all" ||
    taxStatusFilter.kind !== "all" ||
    donationTypeFilter.kind !== "all";

  return (
    <DonationsView
      donations={donations}
      currentFilter={searchFilter}
      textFilterChanged={updateSearchFilter}
      yearFilter={yearFilter}
      yearFilterOptions={yearFilterOptions}
      yearFilterChanged={updateYearFilter}
      categoryFilter={categoryFilter}
      categoryFilterOptions={categoryFilterOptions}
      categoryFilterChanged={updateCategoryFilter}
      amountFilter={amountFilter}
      amountFilterChanged={updateAmountFilter}
      taxStatusFilter={taxStatusFilter}
      taxStatusFilterChanged={updateTaxStatusFilter}
      donationTypeFilter={donationTypeFilter}
      donationTypeFilterChanged={updateDonationTypeFilter}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default DonationsContainer;
