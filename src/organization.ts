import { z } from "zod";
import { type DonationsData, type Org } from "./types";
import { nanoid } from "nanoid";
import { recency as donationRecency } from "./donation";

export const OrgUpsertFieldsSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  taxDeductible: z.boolean(),
  notes: z.string(),
});

export type OrgUpsertFields = z.infer<typeof OrgUpsertFieldsSchema>;

export const defaultFields: OrgUpsertFields = {
  name: "",
  taxDeductible: true,
  notes: "",
};

export const create = (params: OrgUpsertFields): Org => ({
  ...params,
  id: nanoid(),
  modified: Date.now(),
});

export const edit = (params: OrgUpsertFields & { id: string }): Org => ({
  ...params,
  modified: Date.now(),
});

export const recency = (
  orgId: string,
  donationsData: DonationsData
): number => {
  const org = donationsData.orgs.find((o) => o.id === orgId);
  if (!org) return 0;
  const donations = donationsData.donations.filter((d) => d.orgId === orgId);
  return Math.max(
    org.modified,
    ...donations.map((donation) => donationRecency(donation))
  );
};

export const textMatch = (org: Org, filter: string): boolean => {
  // Split filter into keywords by spaces and commas, remove empty strings, lowercase all
  const filterKeywords = filter
    .split(/[\s,]+/)
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);

  // If no filter keywords, everything matches
  if (filterKeywords.length === 0) return true;

  // Get org keywords from name and notes, split by spaces and commas, lowercase all
  const orgKeywords = [org.name, org.notes]
    .join(" ")
    .split(/[\s,]+/)
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);

  // Match if any filter keyword is contained within any org keyword
  return filterKeywords.some((filterKeyword) =>
    orgKeywords.some((orgKeyword) => orgKeyword.includes(filterKeyword))
  );
};
