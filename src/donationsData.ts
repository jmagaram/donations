import { type Donation, type DonationsData, type Org } from "./types";
import { getCurrentYear, extractYear } from "./date";

export type YearFilter = "all" | "current" | "previous" | "last2" | string;

export type AmountFilter =
  | { kind: "all" }
  | { kind: "moreThan"; min: number }
  | { kind: "lessThan"; max: number }
  | { kind: "between"; min: number; max: number };

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

export const getYearRange = (yearFilter: YearFilter, minYear: number, maxYear: number): [number, number] => {
  const currentYear = getCurrentYear();
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
      if (yearFilter.match(/^\d{4}$/)) {
        const year = parseInt(yearFilter);
        return [year, year];
      }
      return [minYear, maxYear];
  }
};

export const generateYearFilterOptions = (data: Readonly<DonationsData>, yearFilter: YearFilter) => {
  const options = [
    { value: "all", label: "All years" },
    { value: "current", label: "Current year" },
    { value: "previous", label: "Previous year" },
    { value: "last2", label: "Last 2 years" },
  ];

  // Add only years that exist in donation data
  const uniqueYears = [
    ...new Set(data.donations.map((d) => extractYear(d.date))),
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

export const generateCategoryFilterOptions = (data: Readonly<DonationsData>) => {
  const options = [{ value: "", label: "Any category" }];

  // Extract unique categories from organizations, filtering out empty/undefined
  const uniqueCategories = [
    ...new Set(
      data.orgs
        .map((org) => org.category)
        .filter(
          (category): category is string =>
            category !== undefined && category.trim() !== "",
        ),
    ),
  ];

  uniqueCategories.sort(); // Alphabetical order
  uniqueCategories.forEach((category) => {
    options.push({ value: category, label: category });
  });

  return options;
};

export const matchesYearFilter = (donation: Donation, yearFrom: number, yearTo: number): boolean => {
  const year = extractYear(donation.date);
  return year >= yearFrom && year <= yearTo;
};

export const matchesAmountFilter = (donation: Donation, amountFilter: AmountFilter): boolean => {
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

export const matchesCategoryFilter = (donation: Donation, data: Readonly<DonationsData>, categoryFilter: string): boolean => {
  if (categoryFilter === "all") return true;
  const org = data.orgs.find((o) => o.id === donation.orgId);
  return org?.category === categoryFilter;
};

export const getOrgName = (data: Readonly<DonationsData>, orgId: string): string => {
  const org = data.orgs.find((o) => o.id === orgId);
  return org?.name || "Unknown Organization";
};

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
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

export const matchesSearchFilter = (donation: Donation, data: Readonly<DonationsData>, searchFilter: string): boolean => {
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
    orgKeywords.some((orgKeyword) => orgKeyword.includes(filterKeyword))
  );
};
