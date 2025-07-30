import { z } from "zod";
import { type Donation, type Org } from "./types";
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

export const recency = (org: Org, donations: Donation[]): number => {
  return Math.max(
    org.modified,
    ...donations.map((donation) => donationRecency(donation))
  );
};
