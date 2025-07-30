import { z } from "zod";
import { type Org } from "./types";
import { nanoid } from "nanoid";

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
