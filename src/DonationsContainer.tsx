import { getCurrentYear, extractYear, compareDatesDesc } from "./date";
import { type DonationsData } from "./types";
import DonationsView, { type DonationDisplay } from "./DonationsView";
import { useUrlParam } from "./useUrlParam";
import {
  type YearFilter,
  type AmountFilter,
  getYearRange,
  generateYearFilterOptions,
  generateCategoryFilterOptions,
  matchesYearFilter,
  matchesAmountFilter,
  matchesCategoryFilter,
  matchesSearchFilter,
  getOrgName,
  formatAmount,
} from "./donationsData";


interface DonationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationsContainer = ({ donationsData }: DonationsContainerProps) => {
  const currentYear = getCurrentYear();

  const years = donationsData.donations.map((d) => extractYear(d.date));
  const minYear = years.length > 0 ? Math.min(...years) : currentYear;
  const maxYear = years.length > 0 ? Math.max(...years) : currentYear;

  const [searchFilter, updateSearchFilter, resetSearchFilter] = useUrlParam({
    paramName: "search",
    parseFromString: (value) => value,
    defaultValue: "",
    noFilterValue: "",
    stringifyValue: (value) => (value === "" ? undefined : value),
  });

  const [yearFilter, updateYearFilter, resetYearFilter] = useUrlParam({
    paramName: "year",
    parseFromString: (value): YearFilter | undefined => {
      if (
        value === "all" ||
        value === "current" ||
        value === "previous" ||
        value === "last2"
      ) {
        return value;
      }
      if (value.match(/^\d{4}$/)) {
        return value;
      }
      return undefined; // Invalid -> use defaultValue
    },
    defaultValue: "all" as YearFilter,
    noFilterValue: "all" as YearFilter,
    stringifyValue: (value) => (value === "all" ? undefined : value),
  });

  const [categoryFilter, updateCategoryFilter, resetCategoryFilter] = useUrlParam({
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

  const [yearFrom, yearTo] = getYearRange(yearFilter, minYear, maxYear);

  const yearFilterOptions = generateYearFilterOptions(donationsData, yearFilter);

  const categoryFilterOptions = generateCategoryFilterOptions(donationsData);


  const donations: DonationDisplay[] = [...donationsData.donations]
    .filter((d) => {
      return matchesYearFilter(d, yearFrom, yearTo) && 
             matchesAmountFilter(d, amountFilter) && 
             matchesCategoryFilter(d, donationsData, categoryFilter) && 
             matchesSearchFilter(d, donationsData, searchFilter);
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
    yearFilter !== "all" ||
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
