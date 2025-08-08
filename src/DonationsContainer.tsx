import { getCurrentYear, compareDatesDesc } from "./date";
import { useMemo } from "react";
import { getDonationYearRange } from "./donationsData";
import { type DonationsData } from "./types";
import DonationsView, { type DonationDisplay } from "./DonationsView";
import { useSearchParams } from "react-router-dom";
import {
  getUniqueOrgCategories,
  matchesYearFilter,
  matchesAmountFilter,
  matchesSearchFilter,
  getOrgName,
} from "./donationsData";
import { getYearRange, yearFilterSearchParam } from "./yearFilter";
import { amountFilterSearchParam } from "./amountFilter";
import { useSearchParam } from "./useSearchParam";
import {
  categoryFilterSearchParam,
  matchesCategoryFilter,
  type CategoryFilter,
} from "./categoryFilter";
import {
  taxStatusParam,
  matchesTaxStatusFilter,
  type TaxStatusFilter,
} from "./taxStatusFilter";
import {
  paymentKindParam,
  matchesPaymentKindFilter,
  type PaymentKindFilterParam,
} from "./donationKindFilter";
import { formatUSD } from "./amount";
import { searchFilterParam, type SearchFilter } from "./searchFilter";

const getAvailableCategories = (
  donationsData: DonationsData,
): CategoryFilter[] => {
  const uniqueCategories = new Set(getUniqueOrgCategories(donationsData));
  const missingCategory = categoryFilterSearchParam.encode("");
  const categories: CategoryFilter[] =
    missingCategory !== undefined ? [missingCategory] : [];
  const sortedCategories = Array.from(uniqueCategories)
    .filter((i) => i.trim().length > 0)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  categories.push(...sortedCategories);
  return categories;
};

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
        (categoryFilter === undefined ||
          matchesCategoryFilter(categoryFilter, org?.category)) &&
        matchesSearchFilter(d, donationsData, searchFilter ?? "") &&
        matchesTaxStatusFilter(taxFilter, org?.taxDeductible ?? false) &&
        matchesPaymentKindFilter(d.kind, paymentKindFilter ?? "all")
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

  const updateSearchFilter = (value: SearchFilter) => {
    const trimmed = value.trim();
    setSearchFilter(trimmed === "" ? undefined : trimmed);
  };

  const updateTaxStatusFilter = (value: TaxStatusFilter | undefined) => {
    setTaxFilter(value);
  };

  const updatePaymentKindFilter = (
    value: PaymentKindFilterParam | undefined,
  ) => {
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
