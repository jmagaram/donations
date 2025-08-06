import { donationTextMatch } from "./donation";
import { getCurrentYear, extractYear, compareDatesDesc } from "./date";
import { type DonationsData } from "./types";
import DonationsView, { type DonationDisplay } from "./DonationsView";
import { useUrlParam } from "./useUrlParam";

type YearFilter = "all" | "current" | "previous" | "last2" | string;

type AmountFilter =
  | { kind: "all" }
  | { kind: "moreThan"; min: number }
  | { kind: "lessThan"; max: number }
  | { kind: "between"; min: number; max: number };

interface DonationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationsContainer = ({ donationsData }: DonationsContainerProps) => {
  const currentYear = getCurrentYear();

  const years = donationsData.donations.map((d) => extractYear(d.date));
  const minYear = years.length > 0 ? Math.min(...years) : currentYear;
  const maxYear = years.length > 0 ? Math.max(...years) : currentYear;

  const [search, updateSearch, resetSearch] = useUrlParam({
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
    defaultValue: "",
    noFilterValue: "",
    stringifyValue: (value) => (value === "" ? undefined : value),
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

  // Calculate year range based on yearFilter
  const getYearRange = (yearFilter: YearFilter): [number, number] => {
    switch (yearFilter) {
      case "all":
        return [minYear, maxYear];
      case "current":
        return [currentYear, currentYear];
      case "previous":
        return [currentYear - 1, currentYear - 1];
      case "last2":
        return [currentYear - 1, currentYear];
      default:
        if (yearFilter.match(/^\d{4}$/)) {
          const year = parseInt(yearFilter);
          return [year, year];
        }
        return [minYear, maxYear];
    }
  };

  const [yearFrom, yearTo] = getYearRange(yearFilter);

  // Generate dynamic year filter options
  const generateYearFilterOptions = () => {
    const options = [
      { value: "all", label: "All years" },
      { value: "current", label: "Current year" },
      { value: "previous", label: "Previous year" },
      { value: "last2", label: "Last 2 years" },
    ];

    // Add only years that exist in donation data
    const uniqueYears = [
      ...new Set(donationsData.donations.map((d) => extractYear(d.date))),
    ];
    uniqueYears.sort((a, b) => b - a); // Newest first
    uniqueYears.forEach((year) => {
      options.push({ value: year.toString(), label: year.toString() });
    });

    // Add URL year if valid and not already in list
    if (
      yearFilter.match(/^\d{4}$/) &&
      !uniqueYears.includes(parseInt(yearFilter))
    ) {
      options.push({ value: yearFilter, label: yearFilter });
    }

    return options;
  };

  const yearFilterOptions = generateYearFilterOptions();

  // Generate dynamic category filter options
  const generateCategoryFilterOptions = () => {
    const options = [{ value: "", label: "Any category" }];

    // Extract unique categories from organizations, filtering out empty/undefined
    const uniqueCategories = [
      ...new Set(
        donationsData.orgs
          .map((org) => org.category)
          .filter(
            (category): category is string =>
              category !== undefined && category.trim() !== "",
          ),
      ),
    ];

    uniqueCategories.sort(); // Alphabetical order
    uniqueCategories.forEach((category) => {
      options.push({ value: category, label: category });
    });

    return options;
  };

  const categoryFilterOptions = generateCategoryFilterOptions();

  const getOrgName = (orgId: string) => {
    const org = donationsData.orgs.find((o) => o.id === orgId);
    return org?.name || "Unknown Organization";
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const donations: DonationDisplay[] = [...donationsData.donations]
    .filter((d) => {
      const year = extractYear(d.date);
      const amt = d.amount;
      const matchesYear = year >= yearFrom && year <= yearTo;
      let matchesAmount = true;
      switch (amountFilter.kind) {
        case "all":
          matchesAmount = true;
          break;
        case "moreThan":
          matchesAmount = amt >= amountFilter.min;
          break;
        case "lessThan":
          matchesAmount = amt <= amountFilter.max;
          break;
        case "between":
          matchesAmount = amt >= amountFilter.min && amt <= amountFilter.max;
          break;
      }
      const org = donationsData.orgs.find((o) => o.id === d.orgId) || {
        name: "",
        notes: "",
        category: undefined,
      };
      const matchesCategory =
        categoryFilter === "" ||
        (org.category && org.category === categoryFilter);
      const matchesText =
        search.trim() === "" || donationTextMatch(search, d, org);
      return matchesYear && matchesAmount && matchesCategory && matchesText;
    })
    .sort((a, b) => compareDatesDesc(a.date, b.date))
    .map((donation) => {
      return {
        id: donation.id,
        date: donation.date,
        amount: formatAmount(donation.amount),
        orgId: donation.orgId,
        orgName: getOrgName(donation.orgId),
        kind: donation.kind,
        notes: donation.notes,
        paymentMethod: donation.paymentMethod,
      };
    });

  const handleClearFilters = () => {
    resetSearch();
    resetYearFilter();
    resetCategoryFilter();
    resetAmountFilter();
  };

  const hasActiveFilters =
    search !== "" ||
    yearFilter !== "all" ||
    amountFilter.kind !== "all" ||
    categoryFilter !== "";

  return (
    <DonationsView
      donations={donations}
      currentFilter={search}
      textFilterChanged={updateSearch}
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
