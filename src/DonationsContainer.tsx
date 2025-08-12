import { getCurrentYear, compareDatesDesc } from "./date";
import { useMemo } from "react";
import { getDonationYearRange } from "./donationsData";
import { type Donation } from "./donation";
import { type DonationsData } from "./donationsData";
import DonationsView, { type DonationDisplay } from "./DonationsView";
import { useSearchParams } from "react-router-dom";
import {
  matchesYearFilter,
  matchesAmountFilter,
  getOrgName,
  createSearchableDonations,
  createFuseConfig,
  scoreDonationAgainstWords,
  filterAndSortDonations,
  type SearchableDonation,
} from "./donationsData";
import Fuse, { type FuseResult } from "fuse.js";
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
import { searchFilterParam, type SearchFilter } from "./searchFilter";

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
  const [searchFilter, setSearchFilter] = useSearchParam(
    "search",
    searchFilterParam,
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

  const { searchableDonations, fuseInstance } = useMemo(() => {
    const orgMap = new Map(donationsData.orgs.map((org) => [org.id, org]));
    const { searchableDonations: searchable } = createSearchableDonations(
      donationsData.donations,
      orgMap,
    );
    const fuse = new Fuse(searchable, createFuseConfig());
    return {
      searchableDonations: searchable,
      fuseInstance: fuse,
    };
  }, [donationsData.donations, donationsData.orgs]);

  const performFuzzySearch = (donations: Donation[], search: string) => {
    if (!search || search.trim() === "" || donations.length === 0) {
      return donations;
    }

    const yearRange = getDonationYearRange(donationsData.donations);
    const minYear = yearRange?.minYear;
    const maxYear = yearRange?.maxYear;

    const words = search.trim().split(/\s+/);

    // Pre-compute search results for all words to avoid redundant searches
    const wordSearchResults = new Map<
      string,
      FuseResult<SearchableDonation>[]
    >();
    words.forEach((word) => {
      wordSearchResults.set(word, fuseInstance.search(word));
    });

    const donationScores = searchableDonations
      .filter((searchable: SearchableDonation) =>
        donations.some((d) => d.id === searchable.id),
      )
      .map((donationObj: SearchableDonation) =>
        scoreDonationAgainstWords(
          donationObj,
          words,
          fuseInstance,
          minYear,
          maxYear,
          wordSearchResults,
        ),
      );
    return filterAndSortDonations(donationScores);
  };

  const [yearFrom, yearTo] = yearFilter
    ? getYearRange({
        yearFilter,
        minYear,
        maxYear,
        currentYear,
      })
    : [minYear, maxYear];

  let filteredDonations = [...donationsData.donations].filter((d) => {
    const org = donationsData.orgs.find((o) => o.id === d.orgId);
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

  const updateSearchFilter = (value: SearchFilter) => {
    // const trimmed = value.trim();
    const trimmed = value;
    setSearchFilter(trimmed === "" ? undefined : trimmed);
  };

  const updateTaxStatusFilter = (value: TaxStatusFilter | undefined) => {
    setTaxFilter(value);
  };

  const updatePaymentKindFilter = (value: KindFilterParam | undefined) => {
    setPaymentKindFilter(value);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

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
      textFilterChanged={updateSearchFilter}
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
