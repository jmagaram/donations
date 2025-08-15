import { z } from "zod";
import { extractYear, type YearRange } from "./date";
import { type AmountFilter } from "./amountFilter";
import { OrgSchema, type Org } from "./organization";
import { DonationSchema, type Donation } from "./donation";
import Fuse, { type IFuseOptions } from "fuse.js";
import { parseCurrency, isAmountWithinTolerancePercent } from "./amount";
import {
  parseStringToDateRanges,
  fullDaysInRange,
  padDateRange,
  isDateInRange,
} from "./date";

export const DonationsDataSchema = z.object({
  orgs: z.array(OrgSchema),
  donations: z.array(DonationSchema),
});

export type DonationsData = z.infer<typeof DonationsDataSchema>;

export function getDonationYearRange(
  donations: Pick<Donation, "date">[],
): YearRange | undefined {
  if (donations.length === 0) return undefined;
  const years = donations.map((d) => extractYear(d.date));
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  return { minYear, maxYear };
}

export const empty = (): DonationsData => ({
  orgs: [],
  donations: [],
});

export const isEmpty = (data: Readonly<DonationsData>): boolean =>
  data.orgs.length === 0 && data.donations.length === 0;

export const findOrgById = (
  data: Readonly<DonationsData>,
  id: string,
): Org | undefined => data.orgs.find((org) => org.id === id);

export const findDonationById = (
  data: Readonly<DonationsData>,
  id: string,
): Donation | undefined =>
  data.donations.find((donation) => donation.id === id);

const orgExistsById = (data: Readonly<DonationsData>, id: string): boolean =>
  findOrgById(data, id) !== undefined;

const donationExistsById = (
  data: Readonly<DonationsData>,
  id: string,
): boolean => findDonationById(data, id) !== undefined;

const orgExistsByName = (
  data: Readonly<DonationsData>,
  name: string,
): boolean =>
  data.orgs.some(
    (org) => org.name.toLowerCase().trim() === name.toLowerCase().trim(),
  );

const replaceItemAtIndex = <T>(array: T[], index: number, item: T): T[] => {
  const newArray = [...array];
  newArray[index] = item;
  return newArray;
};

const removeItemById = <T extends { id: string }>(
  array: T[],
  id: string,
): T[] => array.filter((item) => item.id !== id);

export const orgAdd = (
  data: Readonly<DonationsData>,
  org: Readonly<Org>,
): DonationsData | undefined => {
  const exists = orgExistsById(data, org.id) || orgExistsByName(data, org.name);
  if (exists) {
    return undefined;
  }
  return {
    ...data,
    orgs: [...data.orgs, org],
  };
};

export const orgUpdate = (
  data: Readonly<DonationsData>,
  org: Readonly<Org>,
): DonationsData | undefined => {
  const orgIndex = data.orgs.findIndex(
    (existingOrg) => existingOrg.id === org.id,
  );
  if (orgIndex === -1) {
    return undefined;
  }
  return {
    ...data,
    orgs: replaceItemAtIndex(data.orgs, orgIndex, org),
  };
};

export const orgDelete = (
  data: Readonly<DonationsData>,
  id: string,
): DonationsData => {
  const orgExists = orgExistsById(data, id);
  const donationExists = data.donations.some(
    (donation) => donation.orgId === id,
  );
  if (!orgExists && !donationExists) {
    return data;
  }
  return {
    ...data,
    orgs: removeItemById(data.orgs, id),
    donations: data.donations.filter((donation) => donation.orgId !== id),
  };
};

export const donationAdd = (
  data: Readonly<DonationsData>,
  donation: Readonly<Donation>,
): DonationsData | undefined => {
  const orgExists = orgExistsById(data, donation.orgId);
  const donationExists = donationExistsById(data, donation.id);
  if (!orgExists || donationExists) {
    return undefined;
  }
  return {
    ...data,
    donations: [...data.donations, donation],
  };
};

export const donationUpdate = (
  data: Readonly<DonationsData>,
  donation: Readonly<Donation>,
): DonationsData | undefined => {
  const donationIndex = data.donations.findIndex((d) => d.id === donation.id);
  if (donationIndex === -1) return undefined;
  const orgExists = orgExistsById(data, donation.orgId);
  if (!orgExists) return undefined;
  return {
    ...data,
    donations: replaceItemAtIndex(data.donations, donationIndex, donation),
  };
};

export const donationDelete = (
  data: Readonly<DonationsData>,
  donationId: string,
): DonationsData => {
  const donationExists = donationExistsById(data, donationId);
  if (!donationExists) {
    return data;
  }
  return {
    ...data,
    donations: removeItemById(data.donations, donationId),
  };
};

export const getUniqueDonationYears = (
  data: Readonly<DonationsData>,
): Set<number> => new Set(data.donations.map((d) => extractYear(d.date)));

export const getUniqueOrgCategories = (
  data: Readonly<DonationsData>,
): Set<string> =>
  new Set(
    data.orgs
      .map((org) => org.category)
      .filter(
        (category): category is string =>
          category !== undefined && category.trim() !== "",
      ),
  );

export const matchesYearFilter = (
  donation: Donation,
  yearFrom: number,
  yearTo: number,
): boolean => {
  const year = extractYear(donation.date);
  return year >= yearFrom && year <= yearTo;
};

export const matchesAmountFilter = (
  donation: Donation,
  amountFilter: AmountFilter,
): boolean => {
  const amt = donation.amount;
  switch (amountFilter.kind) {
    case "all":
      return true;
    case "moreThan":
      return amt >= amountFilter.min;
    case "lessThan":
      return amt <= amountFilter.max;
    case "between":
      return amt >= amountFilter.min && amt <= amountFilter.max;
  }
};

export const getOrgName = (
  data: Readonly<DonationsData>,
  orgId: string,
): string => {
  const org = data.orgs.find((o) => o.id === orgId);
  return org?.name || "Unknown organization";
};

export const getOrgNameFromMap = (
  orgMap: Map<string, Org>,
  orgId: string,
): string => {
  const org = orgMap.get(orgId);
  return org?.name || "Unknown organization";
};

export const donationTextMatch = (
  filter: string,
  donation: Donation,
  org: { name: string; notes: string },
): boolean => {
  const getWords = (text: string): string[] =>
    text.toLowerCase().split(/[ ,]+/);
  const filterWords = getWords(filter);
  if (filterWords.length === 0) return true;
  const targetWords = [
    ...getWords(donation.notes),
    donation.kind.toLowerCase(),
    ...getWords(org.name),
    ...getWords(org.notes),
    ...getWords(donation.paymentMethod || ""),
  ];
  return filterWords.some((fw) => targetWords.some((tw) => tw.includes(fw)));
};

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
): string[] => {
  const yearRange = getDonationYearRange(donations);
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

  const { searchableDonations } = createSearchableDonations(donations, orgs);

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
  );

  const allIds = new Set([...textMatchIds, ...amountMatchIds, ...dateMatchIds]);

  const donationMap = new Map(donations.map((d) => [d.id, d]));

  const matchedDonations = Array.from(allIds)
    .map((id) => donationMap.get(id))
    .filter((d): d is Donation => d !== undefined);

  return matchedDonations;
};
