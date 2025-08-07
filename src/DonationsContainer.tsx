import { getCurrentYear, compareDatesDesc } from "./date";
import { useMemo } from "react";
import { getDonationYearRange } from "./donationsData";
import { type DonationsData } from "./types";
import DonationsView, { type DonationDisplay } from "./DonationsView";
import { useSearchParams } from "react-router-dom";
import { useUrlParamValue } from "./urlParam";
import {
  getUniqueDonationYears,
  getUniqueOrgCategories,
  matchesYearFilter,
  matchesAmountFilter,
  matchesSearchFilter,
  getOrgName,
} from "./donationsData";
import {
  type YearFilter,
  yearFilterParam,
  getYearRange,
} from "./yearFilterParam";
import { type AmountFilter, amountFilterParam } from "./amountFilterParam";
import {
  categoryFilterParam,
  matchesCategoryFilter,
} from "./categoryFilterParam";
import {
  taxStatusFilterParam,
  matchesTaxStatusFilter,
} from "./taxStatusFilterParam";
import {
  paymentKindUrlParam,
  matchesPaymentKindFilter,
} from "./donationTypeFilterParam";
import { formatUSD } from "./amount";

const NO_FILTER = "__no_filter__";

const generateYearFilterOptions = (
  donationsData: DonationsData,
  yearFilter: YearFilter | undefined,
) => {
  const options = [
    { value: NO_FILTER, label: "All years" },
    { value: "current", label: "Current year" },
    { value: "previous", label: "Previous year" },
    { value: "last2", label: "Last 2 years" },
  ];

  const uniqueYears = new Set(getUniqueDonationYears(donationsData));

  if (yearFilter?.kind === "other") {
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
  const options = [{ value: NO_FILTER, label: "Any category" }];
  const uniqueCategories = Array.from(getUniqueOrgCategories(donationsData));
  uniqueCategories.sort(); // Alphabetical order
  uniqueCategories.forEach((category) => {
    const categoryFilter = { kind: "exactMatch" as const, category };
    const encodedValue = categoryFilterParam.encode(categoryFilter);
    if (encodedValue) {
      options.push({ value: encodedValue, label: category });
    }
  });
  return options;
};

interface DonationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationsContainer = ({ donationsData }: DonationsContainerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentYear = getCurrentYear();
  const yearRange = getDonationYearRange(donationsData.donations);
  const minYear = yearRange?.minYear ?? currentYear;
  const maxYear = yearRange?.maxYear ?? currentYear;

  const yearFilter = useUrlParamValue("year", yearFilterParam);
  const searchFilter = useUrlParamValue("search", {
    parse: (value: string | undefined) => {
      if (value === undefined || value.trim() === "") {
        return undefined;
      }
      return value;
    },
  });
  const categoryFilter = useUrlParamValue("category", categoryFilterParam);
  const amountFilter = useUrlParamValue("amount", amountFilterParam);
  const taxStatusFilter = useUrlParamValue("tax", taxStatusFilterParam);
  const paymentKindFilter = useUrlParamValue("type", paymentKindUrlParam);

  const categoryFilterOptions = useMemo(
    () => generateCategoryFilterOptions(donationsData),
    [donationsData],
  );

  const yearFilterOptions = useMemo(
    () => generateYearFilterOptions(donationsData, yearFilter),
    [donationsData, yearFilter],
  );

  const [yearFrom, yearTo] = yearFilter
    ? getYearRange({
        yearFilter,
        minYear,
        maxYear,
        currentYear,
      })
    : [minYear, maxYear];

  const donations: DonationDisplay[] = [...donationsData.donations]
    .filter((d) => {
      const org = donationsData.orgs.find((o) => o.id === d.orgId);
      return (
        matchesYearFilter(d, yearFrom, yearTo) &&
        matchesAmountFilter(d, amountFilter ?? { kind: "all" }) &&
        matchesCategoryFilter(categoryFilter, org?.category) &&
        matchesSearchFilter(d, donationsData, searchFilter ?? "") &&
        matchesTaxStatusFilter(taxStatusFilter, org?.taxDeductible ?? false) &&
        matchesPaymentKindFilter(d.kind, paymentKindFilter)
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

  // Update functions
  const updateYearFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const yearFilter =
      value === NO_FILTER ? undefined : yearFilterParam.parse(value);
    const encoded = yearFilterParam.encode(yearFilter ?? { kind: "all" });
    if (encoded) {
      newParams.set("year", encoded);
    } else {
      newParams.delete("year");
    }
    setSearchParams(newParams);
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

  const updateAmountFilter = (newFilter: AmountFilter) => {
    const newParams = new URLSearchParams(searchParams);
    const encoded = amountFilterParam.encode(newFilter);
    if (encoded) {
      newParams.set("amount", encoded);
    } else {
      newParams.delete("amount");
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

  const updatePaymentKindFilter = (value: string) => {
    const paymentKindFilter =
      value === NO_FILTER ? undefined : paymentKindUrlParam.parse(value);
    const newParams = new URLSearchParams(searchParams);
    const encoded = paymentKindUrlParam.encode(paymentKindFilter ?? "all");
    if (encoded) {
      newParams.set("type", encoded);
    } else {
      newParams.delete("type");
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    searchFilter !== undefined ||
    (yearFilter !== undefined && yearFilter.kind !== "all") ||
    (amountFilter !== undefined && amountFilter.kind !== "all") ||
    (categoryFilter !== undefined && categoryFilter.kind !== "all") ||
    (taxStatusFilter !== undefined && taxStatusFilter.kind !== "all") ||
    paymentKindFilter !== undefined;

  // Current values for UI
  const currentYearValue = yearFilter
    ? (yearFilterParam.encode(yearFilter) ?? NO_FILTER)
    : NO_FILTER;
  const currentCategoryValue = categoryFilter
    ? (categoryFilterParam.encode(categoryFilter) ?? NO_FILTER)
    : NO_FILTER;
  // const currentAmountValue = amountFilter
  //   ? (amountFilterParam.encode(amountFilter) ?? NO_FILTER)
  //   : NO_FILTER;
  const currentTaxStatusValue = taxStatusFilter
    ? (taxStatusFilterParam.encode(taxStatusFilter) ?? NO_FILTER)
    : NO_FILTER;
  const currentPaymentKindValue = paymentKindFilter
    ? (paymentKindUrlParam.encode(paymentKindFilter) ?? NO_FILTER)
    : NO_FILTER;

  return (
    <DonationsView
      donations={donations}
      currentFilter={searchFilter ?? ""}
      textFilterChanged={updateSearchFilter}
      yearFilter={currentYearValue}
      yearFilterOptions={yearFilterOptions}
      yearFilterChanged={updateYearFilter}
      categoryFilter={currentCategoryValue}
      categoryFilterOptions={categoryFilterOptions}
      categoryFilterChanged={updateCategoryFilter}
      amountFilter={amountFilter ?? { kind: "all" }}
      amountFilterChanged={updateAmountFilter}
      taxStatusFilter={currentTaxStatusValue}
      taxStatusFilterChanged={updateTaxStatusFilter}
      paymentKindFilter={currentPaymentKindValue}
      paymentKindFilterChanged={updatePaymentKindFilter}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default DonationsContainer;
