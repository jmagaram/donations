import { getCurrentYear, compareDatesDesc } from "./date";
import { useMemo } from "react";
import { getDonationYearRange } from "./donationsData";
import { type DonationsData } from "./types";
import DonationsView, { type DonationDisplay } from "./DonationsView";
import { useUrlParam } from "./useUrlParam";
import {
  type AmountFilter,
  getUniqueDonationYears,
  getUniqueOrgCategories,
  matchesYearFilter,
  matchesAmountFilter,
  matchesCategoryFilter,
  matchesSearchFilter,
  getOrgName,
  formatAmount,
} from "./donationsData";
import {
  getYearRange,
  parseYearFilter,
  stringifyYearFilter,
  type YearFilter,
} from "./yearFilter";

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
  const options = [{ value: "", label: "Any category" }];

  const uniqueCategories = Array.from(getUniqueOrgCategories(donationsData));
  uniqueCategories.sort(); // Alphabetical order
  uniqueCategories.forEach((category) => {
    options.push({ value: category, label: category });
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

  const [yearFilter, updateYearFilter, resetYearFilter] = useUrlParam({
    paramName: "year",
    parseFromString: parseYearFilter,
    defaultValue: { kind: "all" },
    noFilterValue: { kind: "all" },
    stringifyValue: stringifyYearFilter,
  });

  const [searchFilter, updateSearchFilter, resetSearchFilter] = useUrlParam({
    paramName: "search",
    parseFromString: (value) => value,
    defaultValue: "",
    noFilterValue: "",
    stringifyValue: (value) => (value === "" ? undefined : value),
  });

  const [categoryFilter, updateCategoryFilter, resetCategoryFilter] =
    useUrlParam({
      paramName: "category",
      parseFromString: (value) => value,
      defaultValue: "all",
      noFilterValue: "all",
      stringifyValue: (value) => (value === "all" ? undefined : value),
    });

  const [amountFilter, updateAmountFilter, resetAmountFilter] = useUrlParam({
    paramName: "amount",
    parseFromString: (str): AmountFilter | undefined => {
      if (str === "all") return { kind: "all" };

      const parts = str.split("_");
      const type = parts[0];

      switch (type) {
        case "moreThan": {
          if (parts.length !== 2) return undefined;
          const min = parseFloat(parts[1]);
          return isNaN(min) ? undefined : { kind: "moreThan", min };
        }
        case "lessThan": {
          if (parts.length !== 2) return undefined;
          const max = parseFloat(parts[1]);
          return isNaN(max) ? undefined : { kind: "lessThan", max };
        }
        case "between": {
          if (parts.length !== 3) return undefined;
          const min = parseFloat(parts[1]);
          const max = parseFloat(parts[2]);
          return isNaN(min) || isNaN(max)
            ? undefined
            : { kind: "between", min, max };
        }
        default:
          return undefined;
      }
    },
    defaultValue: { kind: "all" },
    noFilterValue: { kind: "all" },
    stringifyValue: (filter) => {
      switch (filter.kind) {
        case "all":
          return undefined;
        case "moreThan":
          return `moreThan_${filter.min}`;
        case "lessThan":
          return `lessThan_${filter.max}`;
        case "between":
          return `between_${filter.min}_${filter.max}`;
      }
    },
    areEqual: (a, b) => {
      if (a.kind !== b.kind) return false;
      switch (a.kind) {
        case "all":
          return true;
        case "moreThan":
          return a.min === (b as typeof a).min;
        case "lessThan":
          return a.max === (b as typeof a).max;
        case "between":
          return a.min === (b as typeof a).min && a.max === (b as typeof a).max;
      }
    },
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
      return (
        matchesYearFilter(d, yearFrom, yearTo) &&
        matchesAmountFilter(d, amountFilter) &&
        matchesCategoryFilter(d, donationsData, categoryFilter) &&
        matchesSearchFilter(d, donationsData, searchFilter)
      );
    })
    .sort((a, b) => compareDatesDesc(a.date, b.date))
    .map((donation) => {
      return {
        id: donation.id,
        date: donation.date,
        amount: formatAmount(donation.amount),
        orgId: donation.orgId,
        orgName: getOrgName(donationsData, donation.orgId),
        kind: donation.kind,
        notes: donation.notes,
        paymentMethod: donation.paymentMethod,
      };
    });

  const handleClearFilters = () => {
    resetSearchFilter();
    resetYearFilter();
    resetCategoryFilter();
    resetAmountFilter();
  };

  const hasActiveFilters =
    searchFilter !== "" ||
    yearFilter.kind !== "all" ||
    amountFilter.kind !== "all" ||
    categoryFilter !== "all";

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
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default DonationsContainer;
