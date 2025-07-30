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

// Returns the most recent date for an org, considering its own modified date and all its donations
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
