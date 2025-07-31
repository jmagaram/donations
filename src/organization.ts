import { z } from "zod";
import { type DonationsData, type Org } from "./types";
import { recency as donationRecency } from "./donation";

export const OrgUpsertFieldsSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  taxDeductible: z.boolean(),
  webSite: z.string().url().optional().or(z.literal("")),
  notes: z.string(),
});

export type OrgUpsertFields = z.infer<typeof OrgUpsertFieldsSchema>;

export const defaultFields: OrgUpsertFields = {
  name: "",
  taxDeductible: true,
  webSite: "",
  notes: "",
};

export const recency = (
  orgId: string,
  donationsData: DonationsData
): number => {
  const org = donationsData.orgs.find((o) => o.id === orgId);
  if (!org) return 0;
  const donations = donationsData.donations.filter((d) => d.orgId === orgId);
  const donationRecencies = donations.map((donation) =>
    donationRecency(donation)
  );
  return donationRecencies.length > 0 ? Math.max(...donationRecencies) : 0;
};

export const textMatch = (org: Org, filter: string): boolean => {
  const filterKeywords = filter
    .split(/[\s,]+/)
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);

  if (filterKeywords.length === 0) return true;

  const orgKeywords = [org.name, org.notes]
    .join(" ")
    .split(/[\s,]+/)
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);

  return filterKeywords.some((filterKeyword) =>
    orgKeywords.some((orgKeyword) => orgKeyword.includes(filterKeyword))
  );
};
