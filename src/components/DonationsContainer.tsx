import { getCurrentYear } from "../date";
import { useState, useCallback, useMemo } from "react";
import { getDonationYearRange } from "../donationsData";
import {
  matchesAmountFilter,
  matchesYearFilter,
  type Donation,
  sortByDateDesc,
  sortByAmountDesc,
  sortByCategoryAZ,
} from "../donation";
import { type DonationsData } from "../donationsData";
import DonationsView, { type DonationDisplay } from "./DonationsView";
import { useSearchParams } from "react-router-dom";
import { fuzzyDonationSearch } from "../fuzzy";
import { getYearRange, yearFilterSearchParam } from "../yearFilter";
import { amountFilterSearchParam } from "../amountFilter";
import { useSearchParam } from "../hooks/useSearchParam";
import type { SearchParam } from "../hooks/useSearchParam";
import {
  categoryFilterSearchParam,
  matchesCategoryFilter,
  getAvailableCategories,
} from "../categoryFilter";
import {
  taxStatusParam,
  matchesTaxStatusFilter,
  type TaxStatusFilter,
} from "../taxStatusFilter";
import {
  paymentKindParam,
  matchesPaymentKindFilter,
  type KindFilterParam,
} from "../kindFilter";
import { type SearchFilter } from "../searchFilter";

interface DonationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationsContainer = ({ donationsData }: DonationsContainerProps) => {
  const [, setSearchParams] = useSearchParams();
  const currentYear = getCurrentYear();
  const yearRange = getDonationYearRange(donationsData.donations);
  const minYear = yearRange?.minYear ?? currentYear;
  const maxYear = yearRange?.maxYear ?? currentYear;

  const [yearFilter, setYearFilter] = useSearchParam(
    "year",
    yearFilterSearchParam
  );

  const [searchFilter, setSearchFilter] = useState<SearchFilter | undefined>(
    undefined
  );

  const [categoryFilter, setCategoryFilter] = useSearchParam(
    "category",
    categoryFilterSearchParam
  );

  const [amountFilter, setAmountFilter] = useSearchParam(
    "amount",
    amountFilterSearchParam
  );

  const [taxFilter, setTaxFilter] = useSearchParam("tax", taxStatusParam);

  const [paymentKindFilter, setPaymentKindFilter] = useSearchParam(
    "type",
    paymentKindParam
  );

  const sortSearchParam: SearchParam<string> = {
    parse: (v: string | undefined) => {
      if (v === undefined) return undefined;
      const normalized = v.trim().toLowerCase();
      if (normalized === "" || normalized === "date") return undefined;
      if (["name", "category", "amount", "date"].includes(normalized))
        return normalized;
      return undefined;
    },
    encode: (v: string) => {
      if (!v) return undefined;
      if (v === "date") return undefined;
      return v;
    },
  };

  const [sortBy, setSortBy] = useSearchParam("sort", sortSearchParam);

  const [yearFrom, yearTo] = yearFilter
    ? getYearRange({
        yearFilter,
        minYear,
        maxYear,
        currentYear,
      })
    : [minYear, maxYear];

  const availableCategories = useMemo(
    () => getAvailableCategories(donationsData),
    [donationsData]
  );

  const performFuzzySearch = (
    donations: Donation[],
    search: string
  ): Donation[] => {
    if (!search || search.trim() === "" || donations.length === 0) {
      return donations;
    }

    return fuzzyDonationSearch(donations, donationsData.orgs, search.trim(), {
      amountTolerancePercent: 10,
      dateScoreCutoff: 0.5,
      textScoreCutoff: 0.4,
      dateSearchToleranceDays: 5,
      maxSearchRangeDays: 42,
    });
  };

  const orgMap = useMemo(
    () => new Map(donationsData.orgs.map((org) => [org.id, org])),
    [donationsData.orgs]
  );

  let filteredDonations = donationsData.donations.filter((d) => {
    const org = orgMap.get(d.orgId);
    return (
      matchesYearFilter(d, yearFrom, yearTo) &&
      (amountFilter === undefined || matchesAmountFilter(d, amountFilter)) &&
      (categoryFilter === undefined ||
        matchesCategoryFilter(categoryFilter, org?.category)) &&
      (taxFilter === undefined ||
        matchesTaxStatusFilter(taxFilter, org?.taxDeductible ?? false)) &&
      (paymentKindFilter === undefined ||
        matchesPaymentKindFilter(d.kind, paymentKindFilter))
    );
  });

  if (searchFilter !== undefined && searchFilter.trim() !== "") {
    filteredDonations = performFuzzySearch(filteredDonations, searchFilter);
  }

  filteredDonations.sort((a, b) => {
    const key = sortBy ?? "date";
    switch (key) {
      case "amount":
        return sortByAmountDesc(a, b);
      case "name": {
        const nameA = (orgMap.get(a.orgId)?.name || "").toLowerCase();
        const nameB = (orgMap.get(b.orgId)?.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      case "category":
        return sortByCategoryAZ(a, b, orgMap);
      case "date":
      default:
        return sortByDateDesc(a, b);
    }
  });

  const donations: DonationDisplay[] = filteredDonations.map((donation) => {
    const org = orgMap.get(donation.orgId);
    return {
      id: donation.id,
      date: donation.date,
      amount: donation.amount,
      orgId: donation.orgId,
      orgName: org?.name || "Unknown organization",
      orgCategory: org?.category,
      orgTaxDeductible: org?.taxDeductible ?? true,
      kind: donation.kind,
      notes: donation.notes,
      paymentMethod: donation.paymentMethod,
    };
  });

  const updateTaxStatusFilter = (value: TaxStatusFilter | undefined) => {
    setTaxFilter(value);
  };

  const updatePaymentKindFilter = (value: KindFilterParam | undefined) => {
    setPaymentKindFilter(value);
  };

  const handleClearFilters = () => {
    setSearchFilter(undefined);
    setSearchParams(new URLSearchParams());
  };

  const handleTextFilterChange = useCallback((value: SearchFilter) => {
    const trimmed = value;
    setSearchFilter(trimmed === "" ? undefined : trimmed);
  }, []);

  const hasActiveFilters =
    searchFilter !== undefined ||
    (yearFilter !== undefined && yearFilter.kind !== "all") ||
    (amountFilter !== undefined && amountFilter.kind !== "all") ||
    categoryFilter !== undefined ||
    (taxFilter !== undefined && taxFilter !== "all") ||
    (paymentKindFilter !== undefined && paymentKindFilter !== "all");

  return (
    <DonationsView
      donations={donations}
      currentFilter={searchFilter ?? ""}
      textFilterChanged={handleTextFilterChange}
      sortBy={sortBy}
      sortByChanged={setSortBy}
      yearFilter={yearFilter}
      minYear={minYear}
      maxYear={maxYear}
      yearFilterChanged={setYearFilter}
      categoryFilter={categoryFilter}
      availableCategories={availableCategories}
      categoryFilterChanged={setCategoryFilter}
      amountFilter={amountFilter ?? { kind: "all" }}
      amountFilterChanged={setAmountFilter}
      taxStatusFilter={taxFilter}
      taxStatusFilterChanged={updateTaxStatusFilter}
      paymentKindFilter={paymentKindFilter}
      paymentKindFilterChanged={updatePaymentKindFilter}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};

export default DonationsContainer;
