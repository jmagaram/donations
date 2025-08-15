import { z } from "zod";
import {
  extractYear,
  intersectYearRange,
  MAX_PARSE_YYYY,
  MIN_PARSE_YYYY,
  type DateRange,
  type YearRange,
} from "./date";
import { type AmountFilter } from "./amountFilter";
import { OrgSchema, type Org } from "./organization";
import { DonationSchema, type Donation } from "./donation";
import Fuse, { type IFuseOptions } from "fuse.js";
import { closeness, parseCurrency } from "./amount";
import { fuzzyDateSearchRange, parseStringToDayRanges } from "./date";
import { generatePermutations } from "./utility";

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

export const createOrgFuseConfig = (): IFuseOptions<SearchableOrg> => ({
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

export const performOrgSearch = (
  orgs: Org[],
  _searchableOrgs: SearchableOrg[],
  fuseInstance: Fuse<SearchableOrg>,
  search: string,
): Org[] => {
  if (!search || search.trim() === "" || orgs.length === 0) {
    return orgs;
  }

  const words = search.trim().split(/\s+/);
  const resultsPerWord = words.map((word) => fuseInstance.search(word));
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

  // Only include orgs that match all words and are in the filtered list
  const orgIds = new Set(orgs.map((o) => o.id));
  const matchingOrgs = Array.from(orgScoreMap.values())
    .filter((entry) => entry.scores.every((score) => score !== undefined))
    .filter((entry) => orgIds.has(entry.org.id))
    .map((entry) => ({
      org: entry.org,
      totalScore: entry.scores.reduce((a, b) => a + (b ?? 1), 0),
    }));
  matchingOrgs.sort((a, b) => a.totalScore - b.totalScore);
  return matchingOrgs.map((entry) => entry.org);
};

export const orgTextMatchFuzzy = (orgs: Org[], search: string): Org[] => {
  if (!search || search.trim() === "") return orgs;
  const searchableOrgs = createSearchableOrgs(orgs);
  const fuse = new Fuse(searchableOrgs, createOrgFuseConfig());
  return performOrgSearch(orgs, searchableOrgs, fuse, search);
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

type SearchInterpretation = {
  text: string | undefined;
  amount: number | undefined;
  dateRange: DateRange | undefined;
};

const isValidInterpretation = (
  interpretation: SearchInterpretation,
): boolean => {
  return (
    interpretation.text !== undefined ||
    interpretation.amount !== undefined ||
    interpretation.dateRange !== undefined
  );
};

type WordCapabilities = {
  amountIndexes: Map<number, number>;
  dateIndexes: Map<number, Array<DateRange>>;
};

type ChoiceCombination = {
  amountIndex: number | null;
  dateIndex: number | null;
};

const parseWordCapabilities = (
  words: string[],
  yearRange: YearRange | undefined,
): WordCapabilities => {
  const amountIndexes = new Map<number, number>();
  const dateIndexes = new Map<number, Array<DateRange>>();

  const relevantYears = yearRange
    ? intersectYearRange(yearRange, {
        minYear: MIN_PARSE_YYYY,
        maxYear: MAX_PARSE_YYYY,
      })
    : undefined;

  words.forEach((word, index) => {
    const amount = parseCurrency(word);
    if (amount !== undefined) {
      amountIndexes.set(index, amount);
    }
    if (relevantYears) {
      const dateRanges = parseStringToDayRanges({
        input: word,
        yearRange: relevantYears,
      });
      if (dateRanges.length > 0) {
        dateIndexes.set(index, dateRanges);
      }
    }
  });

  return { amountIndexes, dateIndexes };
};

const generateChoiceCombinations = (
  capabilities: WordCapabilities,
): ChoiceCombination[] => {
  const { amountIndexes, dateIndexes } = capabilities;
  const amountChoices: (number | null)[] = [null, ...amountIndexes.keys()];
  const dateChoices: (number | null)[] = [null, ...dateIndexes.keys()];

  return amountChoices.flatMap((amountIndex) =>
    dateChoices
      .filter(
        (dateIndex) => !(amountIndex === dateIndex && amountIndex !== null),
      )
      .map((dateIndex) => ({ amountIndex, dateIndex })),
  );
};

const createTextPermutations = (
  words: string[],
  usedIndexes: (number | null)[],
): (string | undefined)[] => {
  const textIndexes = words
    .map((_, i) => i)
    .filter((i) => !usedIndexes.includes(i));
  const textWords = textIndexes.map((i) => words[i]);

  return textWords.length > 0
    ? generatePermutations(textWords).map((perm) => perm.join(" "))
    : [undefined];
};

const buildInterpretations = (
  combinations: ChoiceCombination[],
  words: string[],
  capabilities: WordCapabilities,
): SearchInterpretation[] => {
  const { amountIndexes, dateIndexes } = capabilities;

  return combinations.flatMap(({ amountIndex, dateIndex }) => {
    const textPermutations = createTextPermutations(words, [
      amountIndex,
      dateIndex,
    ]);

    return textPermutations.flatMap((textString): SearchInterpretation[] => {
      if (dateIndex !== null) {
        return dateIndexes.get(dateIndex)!.map(
          (range): SearchInterpretation => ({
            text: textString,
            amount:
              amountIndex !== null
                ? amountIndexes.get(amountIndex)!
                : undefined,
            dateRange: range,
          }),
        );
      } else {
        return [
          {
            text: textString,
            amount:
              amountIndex !== null
                ? amountIndexes.get(amountIndex)!
                : undefined,
            dateRange: undefined,
          },
        ];
      }
    });
  });
};

const generateAllInterpretations = (
  search: string,
  yearRange: YearRange | undefined,
): SearchInterpretation[] => {
  const words = search.trim().split(/\s+/);
  if (words.length === 0) return [];
  const capabilities = parseWordCapabilities(words, yearRange);
  const combinations = generateChoiceCombinations(capabilities);
  const interpretations = buildInterpretations(
    combinations,
    words,
    capabilities,
  );
  return interpretations.filter(isValidInterpretation);
};

const scoreInterpretation = (
  interpretation: SearchInterpretation,
  searchableDonations: SearchableDonation[],
  fuse: Fuse<SearchableDonation>,
): Map<string, number> => {
  const donationScores = new Map<string, number>();

  // Pre-compute text scores into a Map for O(1) lookup
  const textScoreMap = new Map<string, number>();
  if (interpretation.text !== undefined) {
    const textResults = fuse.search(interpretation.text);
    textResults.forEach((result) => {
      const score = result.score;
      if (score !== undefined) {
        textScoreMap.set((result.item as SearchableDonation).id, score);
      }
    });
  }

  // For each donation, calculate scores for this interpretation
  searchableDonations.forEach((donation) => {
    let textScore: number | undefined;
    let amountScore: number | undefined;
    let dateScore: number | undefined;

    // Text score - assign 1 (worst) if no match found
    if (interpretation.text !== undefined) {
      textScore = textScoreMap.get(donation.id) ?? 1;
    }

    // Amount score - rescale to 0.0-0.1 range to make amount matches clearly better than text matches
    if (interpretation.amount !== undefined) {
      amountScore =
        closeness({
          value: donation.original.amount,
          target: interpretation.amount,
          tolerancePercent: 10,
        }) * 0.1;
    }

    // Date score
    if (interpretation.dateRange !== undefined) {
      dateScore = fuzzyDateSearchRange({
        searchRange: interpretation.dateRange,
        target: new Date(donation.original.date),
        paddingDays: 5,
      });
    }

    // AND logic: ALL components must be good (Math.max in fuzzy scoring where lower = better)
    const componentScores = [textScore, amountScore, dateScore].filter(
      (score): score is number => score !== undefined,
    );

    if (componentScores.length > 0) {
      const finalScore = Math.max(...componentScores); // Worst component determines final score

      donationScores.set(donation.id, finalScore);
    }
  });

  return donationScores;
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

export const donationTextMatchFuzzyTyped = (
  donations: Donation[],
  orgs: Org[],
  search: string,
): Donation[] => {
  if (!search || search.trim() === "" || donations.length === 0) {
    return donations;
  }

  const { searchableDonations, yearRange } = createSearchableDonations(
    donations,
    orgs,
  );

  const fuse = new Fuse(searchableDonations, fuseConfigForDonations());

  // Generate all possible interpretations of the search query
  const interpretations = generateAllInterpretations(search, yearRange);

  // Track best score per donation across all interpretations
  const bestDonationScores = new Map<string, number>();

  // Score each interpretation and keep the best score per donation
  interpretations.forEach((interpretation) => {
    const interpretationScores = scoreInterpretation(
      interpretation,
      searchableDonations,
      fuse,
    );

    interpretationScores.forEach((score, donationId) => {
      const currentBest = bestDonationScores.get(donationId) ?? 1;
      const newBest = Math.min(currentBest, score);
      bestDonationScores.set(donationId, newBest);
    });
  });

  // Create final results sorted by best score
  const donationFinalScores = Array.from(bestDonationScores.entries())
    .map(([donationId, finalScore]) => {
      const donation = searchableDonations.find(
        (d) => d.id === donationId,
      )?.original;
      return { donation, finalScore };
    })
    .filter((entry) => entry.donation && entry.finalScore < 1) // Only include good matches
    .sort((a, b) => a.finalScore - b.finalScore); // Lower scores are better

  return donationFinalScores.map((entry) => entry.donation!);
};
