import { extractYear } from "./date";
import { type AmountFilter } from "./amountFilter";
import { type Donation, type DonationsData, type Org } from "./types";
import Fuse from "fuse.js";
import { fuzzyAmountMatch } from "./amount";
import { fuzzyDateSearchFromRanges, parseStringToDayRanges } from "./date";

export function getDonationYearRange(
  donations: Pick<Donation, "date">[]
): { minYear: number; maxYear: number } | undefined {
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
  id: string
): Org | undefined => data.orgs.find((org) => org.id === id);

export const findDonationById = (
  data: Readonly<DonationsData>,
  id: string
): Donation | undefined =>
  data.donations.find((donation) => donation.id === id);

const orgExistsById = (data: Readonly<DonationsData>, id: string): boolean =>
  findOrgById(data, id) !== undefined;

const donationExistsById = (
  data: Readonly<DonationsData>,
  id: string
): boolean => findDonationById(data, id) !== undefined;

const orgExistsByName = (
  data: Readonly<DonationsData>,
  name: string
): boolean =>
  data.orgs.some(
    (org) => org.name.toLowerCase().trim() === name.toLowerCase().trim()
  );

const replaceItemAtIndex = <T>(array: T[], index: number, item: T): T[] => {
  const newArray = [...array];
  newArray[index] = item;
  return newArray;
};

const removeItemById = <T extends { id: string }>(
  array: T[],
  id: string
): T[] => array.filter((item) => item.id !== id);

export const orgAdd = (
  data: Readonly<DonationsData>,
  org: Readonly<Org>
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
  org: Readonly<Org>
): DonationsData | undefined => {
  const orgIndex = data.orgs.findIndex(
    (existingOrg) => existingOrg.id === org.id
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
  id: string
): DonationsData => {
  const orgExists = orgExistsById(data, id);
  const donationExists = data.donations.some(
    (donation) => donation.orgId === id
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
  donation: Readonly<Donation>
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
  donation: Readonly<Donation>
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
  donationId: string
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
  data: Readonly<DonationsData>
): Set<number> => new Set(data.donations.map((d) => extractYear(d.date)));

export const getUniqueOrgCategories = (
  data: Readonly<DonationsData>
): Set<string> =>
  new Set(
    data.orgs
      .map((org) => org.category)
      .filter(
        (category): category is string =>
          category !== undefined && category.trim() !== ""
      )
  );

export const matchesYearFilter = (
  donation: Donation,
  yearFrom: number,
  yearTo: number
): boolean => {
  const year = extractYear(donation.date);
  return year >= yearFrom && year <= yearTo;
};

export const matchesAmountFilter = (
  donation: Donation,
  amountFilter: AmountFilter
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
  orgId: string
): string => {
  const org = data.orgs.find((o) => o.id === orgId);
  return org?.name || "Unknown organization";
};

export const donationTextMatch = (
  filter: string,
  donation: Donation,
  org: { name: string; notes: string }
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

export const orgTextMatchFuzzy = (orgs: Org[], search: string): Org[] => {
  if (!search || search.trim() === "") return orgs;
  const searchableOrgs = orgs.map((org) => ({
    name: org.name,
    category: org.category || "",
    notes: org.notes || "",
    original: org,
  }));
  const fuse = new Fuse(searchableOrgs, {
    keys: [
      { name: "name", weight: 5 },
      { name: "category", weight: 3 },
      { name: "notes", weight: 1 },
    ],
    includeScore: true,
    threshold: 0.4,
    shouldSort: true,
    useExtendedSearch: true,
  });
  const words = search.trim().split(/\s+/);
  const resultsPerWord = words.map((word) => fuse.search(word));
  const orgScoreMap = new Map<string, { org: Org; scores: number[] }>();
  resultsPerWord.forEach((results, wordIdx) => {
    results.forEach((res) => {
      const key = res.item.original.id;
      if (!orgScoreMap.has(key)) {
        orgScoreMap.set(key, {
          org: res.item.original,
          scores: Array(words.length).fill(undefined),
        });
      }
      orgScoreMap.get(key)!.scores[wordIdx] = res.score ?? 1;
    });
  });
  const matchingOrgs = Array.from(orgScoreMap.values())
    .filter((entry) => entry.scores.every((score) => score !== undefined))
    .map((entry) => ({
      org: entry.org,
      totalScore: entry.scores.reduce((a, b) => a + (b ?? 1), 0),
    }));
  matchingOrgs.sort((a, b) => a.totalScore - b.totalScore);
  return matchingOrgs.map((entry) => entry.org);
};

// issues
// if type a number, maybe search for a donation amount BUT
// that number may not match ANY text field, and we're doing AND searching
// relevant number searches:
//   donation amount
//   check number like "check 2334"
//   credit card number like wells fargo 3334
//   dates
export const donationTextMatchFuzzy = (
  donations: Donation[],
  orgs: Org[],
  search: string
): Donation[] => {
  if (!search || search.trim() === "") return donations;
  const orgMap = new Map(orgs.map((org) => [org.id, org]));
  const searchableDonations = donations.map((donation) => {
    const org = orgMap.get(donation.orgId);
    return {
      id: donation.id,
      orgName: org?.name || "",
      orgNotes: org?.notes || "",
      donationNotes: donation.notes || "",
      kind: donation.kind || "",
      paymentMethod: donation.paymentMethod || "",
      amount: donation.amount,
      original: donation,
    };
  });
  const fuse = new Fuse(searchableDonations, {
    keys: [
      { name: "orgName", weight: 4 },
      { name: "orgNotes", weight: 2 },
      { name: "donationNotes", weight: 2 },
      { name: "kind", weight: 1 },
      { name: "paymentMethod", weight: 1 },
    ],
    includeScore: true,
    threshold: 0.4,
    shouldSort: true,
    useExtendedSearch: true,
  });
  const words = search.trim().split(/\s+/);
  // For each donation, for each word, get best score (min of text and amount)
  const donationScoreMap = new Map<
    string,
    { donation: Donation; scores: number[] }
  >();
  for (const donationObj of searchableDonations) {
    const scores: number[] = [];
    for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
      const word = words[wordIdx];
      // Text search score (Fuse)
      let textScore = 1;
      const fuseResults = fuse
        .search(word)
        .find((r) => r.item.id === donationObj.id);
      if (fuseResults) textScore = fuseResults.score ?? 1;
      // Amount search score
      let amountScore = 1;
      if (!isNaN(Number(word))) {
        amountScore = fuzzyAmountMatch({
          searchWithin: String(donationObj.amount),
          searchFor: word,
          tolerancePercent: 10,
        });
      }
      // Date search score (only if word looks like a date)
      let dateScore = 1;
      const dateRanges = parseStringToDayRanges({
        input: word,
        minYear: 2015,
        maxYear: 2035,
      });
      if (dateRanges.length > 0) {
        dateScore = fuzzyDateSearchFromRanges({
          searchForRanges: dateRanges,
          target: new Date(donationObj.original.date),
          paddingDays: 5,
        });
      }
      // OR: take the best (lowest) score
      const bestScore = Math.min(textScore, amountScore, dateScore);
      scores.push(bestScore);
    }
    donationScoreMap.set(donationObj.id, {
      donation: donationObj.original,
      scores,
    });
  }
  // AND: must match all words (score < 1 for each)
  const matchingDonations = Array.from(donationScoreMap.values())
    .filter((entry) => entry.scores.every((score) => score < 1))
    .map((entry) => ({
      donation: entry.donation,
      totalScore: entry.scores.reduce((a, b) => a + b, 0),
    }));
  matchingDonations.sort((a, b) => a.totalScore - b.totalScore);
  return matchingDonations.map((entry) => entry.donation);
};
