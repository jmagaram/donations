import { getCurrentYear, compareDatesDesc } from "./date";
import { useState, useCallback, useMemo } from "react";
import { getDonationYearRange } from "./donationsData";
import { type Donation } from "./donation";
import { type DonationsData } from "./donationsData";
import DonationsView, { type DonationDisplay } from "./DonationsView";
import { useSearchParams } from "react-router-dom";
import {
  matchesYearFilter,
  matchesAmountFilter,
  getOrgName,
  getOrgNameFromMap,
  donationTextMatchFuzzyTyped,
} from "./donationsData";
import { getYearRange, yearFilterSearchParam } from "./yearFilter";
import { amountFilterSearchParam } from "./amountFilter";
import { useSearchParam } from "./useSearchParam";
import {
  categoryFilterSearchParam,
  matchesCategoryFilter,
  getAvailableCategories,
} from "./categoryFilter";
import {
  taxStatusParam,
  matchesTaxStatusFilter,
  type TaxStatusFilter,
} from "./taxStatusFilter";
import {
  paymentKindParam,
  matchesPaymentKindFilter,
  type KindFilterParam,
} from "./kindFilter";
import { formatUSD } from "./amount";
import { type SearchFilter } from "./searchFilter";

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
    yearFilterSearchParam,
  );
  const [searchFilter, setSearchFilter] = useState<SearchFilter | undefined>(
    undefined,
  );
  const [categoryFilter, setCategoryFilter] = useSearchParam(
    "category",
    categoryFilterSearchParam,
  );
  const [amountFilter, setAmountFilter] = useSearchParam(
    "amount",
    amountFilterSearchParam,
  );
  const [taxFilter, setTaxFilter] = useSearchParam("tax", taxStatusParam);
  const [paymentKindFilter, setPaymentKindFilter] = useSearchParam(
    "type",
    paymentKindParam,
  );

  const availableCategories = useMemo(
    () => getAvailableCategories(donationsData),
    [donationsData],
  );

  const performFuzzySearch = (donations: Donation[], search: string) => {
    if (!search || search.trim() === "" || donations.length === 0) {
      return donations;
    }

    return donationTextMatchFuzzyTyped(
      donations,
      donationsData.orgs,
      search.trim(),
    );
  };

  const [yearFrom, yearTo] = yearFilter
    ? getYearRange({
        yearFilter,
        minYear,
        maxYear,
        currentYear,
      })
    : [minYear, maxYear];

  const orgMap = useMemo(
    () => new Map(donationsData.orgs.map((org) => [org.id, org])),
    [donationsData.orgs],
  );

  let filteredDonations = [...donationsData.donations].filter((d) => {
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

  const donations: DonationDisplay[] = filteredDonations
    .sort((a, b) =>
      // When searching, preserve search relevance order; otherwise sort by date
      searchFilter !== undefined && searchFilter.trim() !== ""
        ? 0
        : compareDatesDesc(a.date, b.date),
    )
    .map((donation) => {
      return {
        id: donation.id,
        date: donation.date,
        amount: formatUSD(donation.amount, "hidePennies"),
        orgId: donation.orgId,
        orgName: getOrgNameFromMap(orgMap, donation.orgId),
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
