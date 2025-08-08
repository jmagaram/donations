import { type Donation, type DonationsData, type Org } from "./types";
import { extractYear } from "./date";
import { type AmountFilter } from "./amountFilter";

export function getDonationYearRange(
  donations: Pick<Donation, "date">[],
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

/** Return the set of non-empty categories assigned to all organizations. */
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

export const matchesSearchFilter = (
  donation: Donation,
  data: Readonly<DonationsData>,
  searchFilter: string,
): boolean => {
  if (searchFilter === "") return true;
  const org = data.orgs.find((o) => o.id === donation.orgId) || {
    name: "",
    notes: "",
    category: undefined,
  };
  return donationTextMatch(searchFilter, donation, org);
};

export const orgTextMatch = (org: Org, filter: string): boolean => {
  const filterKeywords = filter
    .split(/[\s,]+/)
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);
  if (filterKeywords.length === 0) return true;
  const orgKeywords = [org.name, org.category, org.notes]
    .filter(Boolean)
    .join(" ")
    .split(/[\s,]+/)
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);
  return filterKeywords.some((filterKeyword) =>
    orgKeywords.some((orgKeyword) => orgKeyword.includes(filterKeyword)),
  );
};

export const scoreSearchOrganization = (
  data: Readonly<DonationsData>,
  orgId: string,
  search: string,
): number | undefined => {
  const org = findOrgById(data, orgId);
  if (!org) {
    return undefined;
  }

  const lowerCaseSearch = search.toLowerCase();
  if (org.name.toLowerCase().includes(lowerCaseSearch)) {
    return 1;
  }
  if (org.notes.toLowerCase().includes(lowerCaseSearch)) {
    return 2;
  }

  return undefined;
};

export const scoreSearchDonation = (
  data: Readonly<DonationsData>,
  donationId: string,
  search: string,
): number | undefined => {
  const donation = findDonationById(data, donationId);
  if (!donation) {
    return undefined;
  }

  const lowerCaseSearch = search.toLowerCase();
  if (donation.notes.toLowerCase().includes(lowerCaseSearch)) {
    return 1;
  }

  const org = findOrgById(data, donation.orgId);
  if (org && org.name.toLowerCase().includes(lowerCaseSearch)) {
    return 2;
  }
  if (org && org.notes.toLowerCase().includes(lowerCaseSearch)) {
    return 3;
  }

  return undefined;
};

export const search = (
  data: Readonly<DonationsData>,
  search: string,
): { orgs: Org[]; donations: Donation[] } => {
  if (search.trim() === "") {
    return { orgs: [], donations: [] };
  }

  const scoredOrgs = data.orgs
    .map((org) => ({
      org,
      score: scoreSearchOrganization(data, org.id, search),
    }))
    .filter((item): item is { org: Org; score: number } => item.score !== undefined);

  scoredOrgs.sort((a, b) => a.score - b.score);

  const scoredDonations = data.donations
    .map((donation) => ({
      donation,
      score: scoreSearchDonation(data, donation.id, search),
    }))
    .filter(
      (item): item is { donation: Donation; score: number } =>
        item.score !== undefined,
    );

  scoredDonations.sort((a, b) => a.score - b.score);

  return {
    orgs: scoredOrgs.map((item) => item.org),
    donations: scoredDonations.map((item) => item.donation),
  };
};
