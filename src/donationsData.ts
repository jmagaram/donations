import { z } from "zod";
import { extractYear, type YearRange } from "./date";
import { OrgSchema, type Org } from "./organization";
import { DonationSchema, type Donation } from "./donation";
import { replaceItemAtIndex, countOccurrences } from "./utility";

export const DonationsDataSchema = z
  .object({
    orgs: z.array(OrgSchema),
    donations: z.array(DonationSchema),
  })
  .superRefine((data, ctx) => {
    // Organization name uniqueness (case-insensitive, trimmed)
    const orgNameCounts = countOccurrences(data.orgs, (org: Org) =>
      org.name.trim().toLowerCase()
    );
    for (const [name, count] of orgNameCounts.entries()) {
      if (count > 1) {
        ctx.addIssue({
          code: "custom",
          message: `Organization names must be unique, but the name '${name}' appears ${count} times.`,
          path: ["orgs"],
        });
      }
    }

    // Organization ID uniqueness (trimmed)
    const orgIdCounts = countOccurrences(data.orgs, (org: Org) =>
      org.id.trim()
    );
    for (const [id, count] of orgIdCounts.entries()) {
      if (count > 1) {
        ctx.addIssue({
          code: "custom",
          message: `Organization IDs must be unique, but the ID '${id}' appears ${count} times.`,
          path: ["orgs"],
        });
      }
    }

    // Donation ID uniqueness (trimmed)
    const donationIdCounts = countOccurrences(
      data.donations,
      (donation: Donation) => donation.id.trim()
    );
    for (const [id, count] of donationIdCounts.entries()) {
      if (count > 1) {
        ctx.addIssue({
          code: "custom",
          message: `Donation IDs must be unique, but the ID '${id}' appears ${count} times.`,
          path: ["donations"],
        });
      }
    }

    // Each donation's orgId must refer to a valid organization ID (exact match)
    const validOrgIds = new Set(data.orgs.map((org) => org.id));
    for (const donation of data.donations) {
      const orgId = donation.orgId;
      if (!validOrgIds.has(orgId)) {
        ctx.addIssue({
          code: "custom",
          message: `Donation '${donation.id}' on ${donation.date} refers to a non-existent organization ID '${donation.orgId}'.`,
          path: ["donations"],
        });
      }
    }
  });

export type DonationsData = z.infer<typeof DonationsDataSchema>;

export function getDonationYearRange(
  donations: Pick<Donation, "date">[]
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
