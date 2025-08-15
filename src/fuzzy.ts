import { extractYear, type YearRange } from "./date";
import { type Org } from "./organization";
import { type Donation } from "./donation";
import Fuse, { type IFuseOptions } from "fuse.js";
import { parseCurrency, isAmountWithinTolerancePercent } from "./amount";
import {
  parseStringToDateRanges,
  fullDaysInRange,
  padDateRange,
  isDateInRange,
} from "./date";

export interface SearchableOrg {
  name: string;
  category: string;
  notes: string;
  original: Org;
}

export const createSearchableOrgs = (orgs: Org[]): SearchableOrg[] => {
  return orgs.map((org) => ({
    name: org.name,
    category: org.category || "",
    notes: org.notes || "",
    original: org,
  }));
};

export const fuseConfigForOrgs = (): IFuseOptions<SearchableOrg> => ({
  keys: [
    { name: "name", weight: 5 },
    { name: "category", weight: 1 },
    { name: "notes", weight: 2 },
  ],
  includeScore: true,
  threshold: 0.6,
  shouldSort: true,
  useExtendedSearch: false,
});

export const fuzzyOrgSearch = (orgs: Org[], search: string): Org[] => {
  if (!search || search.trim() === "") return orgs;
  const searchableOrgs = createSearchableOrgs(orgs);
  const fuse = new Fuse(searchableOrgs, fuseConfigForOrgs());

  const results = fuse.search(search.trim());
  return results.map((result) => result.item.original);
};

export interface SearchableDonation {
  id: string;
  orgName: string;
  orgNotes: string;
  donationNotes: string;
  kind: string;
  paymentMethod: string;
  original: Donation;
}

export const createSearchableDonations = (
  donations: Donation[],
  orgs: Org[],
): {
  searchableDonations: SearchableDonation[];
  yearRange: YearRange | undefined;
} => {
  const orgMap = new Map(orgs.map((org) => [org.id, org]));
  if (donations.length === 0) {
    return {
      searchableDonations: [],
      yearRange: undefined,
    };
  }

  return donations.reduce(
    (acc, donation) => {
      const org = orgMap.get(donation.orgId);
      const searchable: SearchableDonation = {
        id: donation.id,
        orgName: org?.name || "",
        orgNotes: org?.notes || "",
        donationNotes: donation.notes || "",
        kind: donation.kind || "",
        paymentMethod: donation.paymentMethod || "",
        original: donation,
      };
      const year = extractYear(donation.date);
      return {
        searchableDonations: [...acc.searchableDonations, searchable],
        yearRange: acc.yearRange
          ? {
              minYear: Math.min(acc.yearRange.minYear, year),
              maxYear: Math.max(acc.yearRange.maxYear, year),
            }
          : { minYear: year, maxYear: year },
      };
    },
    {
      searchableDonations: [] as SearchableDonation[],
      yearRange: undefined as YearRange | undefined,
    },
  );
};

export const fuseConfigForDonations = (): IFuseOptions<SearchableDonation> => ({
  keys: [
    { name: "orgName", weight: 8 },
    { name: "orgNotes", weight: 2 },
    { name: "donationNotes", weight: 2 },
    { name: "kind", weight: 1 },
    { name: "paymentMethod", weight: 1 },
  ],
  includeScore: true,
  threshold: 0.4,
  shouldSort: false,
  useExtendedSearch: false,
});

export type SearchConfig = {
  amountTolerancePercent: number;
  dateScoreCutoff: number;
  textScoreCutoff: number;
  dateSearchToleranceDays: number;
  maxSearchRangeDays: number;
};

/**
 * Performs a text search on the donations using Fuse.js.
 * @param searchableDonations - The donations to search.
 * @param search - The search string.
 * @param textScoreCutoff - The score cutoff for the search.
 * @returns An array of donation IDs that match the search.
 */
const searchByText = (
  searchableDonations: SearchableDonation[],
  search: string,
  textScoreCutoff: number,
): string[] => {
  const fuse = new Fuse(searchableDonations, fuseConfigForDonations());
  const results = fuse.search(search.trim());
  return results
    .filter((result) => (result.score ?? 1) < textScoreCutoff)
    .map((result) => result.item.id);
};

/**
 * Performs an amount search on the donations.
 * @param donations - The donations to search.
 * @param search - The search string.
 * @param amountTolerance - The tolerance for the amount search.
 * @param amountScoreCutoff - The score cutoff for the amount search.
 * @returns An array of donation IDs that match the search.
 */
const searchByAmount = (
  donations: Donation[],
  search: string,
  amountTolerance: number,
): string[] => {
  const amount = parseCurrency(search);
  if (amount === undefined) {
    return [];
  }
  return donations
    .filter((donation) =>
      isAmountWithinTolerancePercent({
        target: amount,
        value: donation.amount,
        tolerancePercent: amountTolerance,
      }),
    )
    .map((donation) => donation.id);
};

/**
 * Performs a date search on the donations.
 * @param donations - The donations to search.
 * @param search - The search string.
 * @param dateSearchToleranceDays - Number of days to pad each search range for tolerance.
 * @param maxSearchRangeDays - Maximum allowed days in a padded range.
 * @returns An array of donation IDs that match the search.
 */
const searchByDate = (
  donations: Donation[],
  search: string,
  dateSearchToleranceDays: number,
  maxSearchRangeDays: number,
  yearRange: YearRange | undefined,
): string[] => {
  if (!yearRange) {
    return [];
  }
  const dateRanges = parseStringToDateRanges({
    input: search,
    yearRange,
  });
  if (dateRanges.length === 0) {
    return [];
  }

  const paddedRanges = dateRanges
    .map((range) => padDateRange(range, dateSearchToleranceDays))
    .filter(
      (paddedRange) => fullDaysInRange(paddedRange) <= maxSearchRangeDays,
    );

  const matchingDonationIds = new Set<string>();
  for (const donation of donations) {
    const donationDate = new Date(donation.date);
    for (const paddedRange of paddedRanges) {
      if (isDateInRange(donationDate, paddedRange)) {
        matchingDonationIds.add(donation.id);
        break; // Move to the next donation once a match is found
      }
    }
  }
  return Array.from(matchingDonationIds);
};

export const fuzzyDonationSearch = (
  donations: Donation[],
  orgs: Org[],
  search: string,
  config: SearchConfig,
): Donation[] => {
  if (!search || search.trim() === "" || donations.length === 0) {
    return donations;
  }

  const { searchableDonations, yearRange } = createSearchableDonations(donations, orgs);

  const textMatchIds = searchByText(
    searchableDonations,
    search,
    config.textScoreCutoff,
  );

  const amountMatchIds = searchByAmount(
    donations,
    search,
    config.amountTolerancePercent,
  );

  const dateMatchIds = searchByDate(
    donations,
    search,
    config.dateSearchToleranceDays,
    config.maxSearchRangeDays,
    yearRange,
  );

  const allIds = new Set([...textMatchIds, ...amountMatchIds, ...dateMatchIds]);

  const donationMap = new Map(donations.map((d) => [d.id, d]));

  const matchedDonations = Array.from(allIds)
    .map((id) => donationMap.get(id))
    .filter((d): d is Donation => d !== undefined);

  return matchedDonations;
};