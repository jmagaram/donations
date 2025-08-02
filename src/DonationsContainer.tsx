import { useSearchParams } from "react-router-dom";
import { donationTextMatch } from "./donation";
import { getCurrentYear, extractYear, compareDatesDesc } from "./date";
import { type DonationsData } from "./types";
import DonationsView, { type DonationDisplay } from "./DonationsView";

type YearFilter = "all" | "current" | "previous" | "last2" | string;
type AmountFilterType = "all" | "moreThan" | "lessThan" | "between";

interface DonationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationsContainer = ({ donationsData }: DonationsContainerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentYear = getCurrentYear();

  const years = donationsData.donations.map((d) => extractYear(d.date));
  const minYear = years.length > 0 ? Math.min(...years) : currentYear;
  const maxYear = years.length > 0 ? Math.max(...years) : currentYear;

  // Read state from URL parameters
  const filter = searchParams.get("search") || "";
  const yearFilter = (searchParams.get("year") as YearFilter) || "all";
  const amountFilter = (searchParams.get("amountFilter") as AmountFilterType) || "all";
  const minAmount = parseInt(searchParams.get("min") || "0") || 0;
  const maxAmount = parseInt(searchParams.get("max") || "") || Number.POSITIVE_INFINITY;

  // URL update functions
  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const updateFilter = (newFilter: string) => {
    updateSearchParams({ search: newFilter || undefined });
  };

  const updateYearFilter = (newYearFilter: YearFilter) => {
    updateSearchParams({ year: newYearFilter });
  };

  const updateAmountFilter = (
    filterType: AmountFilterType,
    minValue?: number,
    maxValue?: number
  ) => {
    // Auto-swap if min > max for "between" type
    let finalMin = minValue;
    let finalMax = maxValue;
    if (filterType === "between" && minValue && maxValue && minValue > maxValue) {
      finalMin = maxValue;
      finalMax = minValue;
    }

    const updates: Record<string, string | undefined> = {
      amountFilter: filterType === "all" ? undefined : filterType,
    };

    switch (filterType) {
      case "all":
        updates.min = undefined;
        updates.max = undefined;
        break;
      case "moreThan":
        updates.min = finalMin?.toString();
        updates.max = undefined;
        break;
      case "lessThan":
        updates.min = undefined;
        updates.max = finalMax?.toString();
        break;
      case "between":
        updates.min = finalMin?.toString();
        updates.max = finalMax?.toString();
        break;
    }

    updateSearchParams(updates);
  };

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
        // Handle 4-digit years from URL
        if (yearFilter.match(/^\d{4}$/)) {
          const year = parseInt(yearFilter);
          return [year, year];
        }
        // Invalid format - fallback to "all"
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

  // Generate dynamic amount filter options
  const generateAmountOptions = () => {
    const minAmountPresets = [100, 250, 500, 1000, 2500, 5000];
    const maxAmountPresets = [5000, 2500, 1000, 500, 250, 100]; // Descending order

    // Add URL values if valid and not already in presets
    const minOptions = [...minAmountPresets];
    const maxOptions = [...maxAmountPresets];

    if (minAmount > 0 && !minAmountPresets.includes(minAmount)) {
      minOptions.push(minAmount);
      minOptions.sort((a, b) => a - b); // Keep ascending order
    }

    if (maxAmount !== Number.POSITIVE_INFINITY && !maxAmountPresets.includes(maxAmount)) {
      maxOptions.push(maxAmount);
      maxOptions.sort((a, b) => b - a); // Keep descending order
    }

    return { minOptions, maxOptions };
  };

  const { minOptions, maxOptions } = generateAmountOptions();

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
      // Amount filtering logic based on filter type
      let matchesAmount = true;
      switch (amountFilter) {
        case "all":
          matchesAmount = true;
          break;
        case "moreThan":
          matchesAmount = amt >= minAmount;
          break;
        case "lessThan":
          matchesAmount = maxAmount === Number.POSITIVE_INFINITY || amt <= maxAmount;
          break;
        case "between":
          matchesAmount = amt >= minAmount && (maxAmount === Number.POSITIVE_INFINITY || amt <= maxAmount);
          break;
      }
      const org = donationsData.orgs.find((o) => o.id === d.orgId) || {
        name: "",
        notes: "",
      };
      const matchesText =
        filter.trim() === "" || donationTextMatch(filter, d, org);
      return matchesYear && matchesAmount && matchesText;
    })
    .sort((a, b) => compareDatesDesc(a.date, b.date))
    .map((donation) => {
      const notesWithPayment = donation.paymentMethod 
        ? `${donation.notes}${donation.notes ? '\n' : ''}${donation.paymentMethod}`
        : donation.notes;
      return {
        id: donation.id,
        date: donation.date,
        amount: formatAmount(donation.amount),
        orgId: donation.orgId,
        orgName: getOrgName(donation.orgId),
        kind: donation.kind,
        notes: notesWithPayment,
        paymentMethod: donation.paymentMethod,
      };
    });

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = filter !== "" || yearFilter !== "all" || amountFilter !== "all";

  return (
    <DonationsView
      donations={donations}
      currentFilter={filter}
      textFilterChanged={updateFilter}
      yearFilter={yearFilter}
      yearFilterOptions={yearFilterOptions}
      yearFilterChanged={updateYearFilter}
      amountFilter={amountFilter}
      minAmount={minAmount}
      maxAmount={maxAmount}
      minAmountOptions={minOptions}
      maxAmountOptions={maxOptions}
      amountFilterChanged={updateAmountFilter}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default DonationsContainer;
