import { z } from "zod";
import { type Organization } from "./types";
import { nanoid } from "nanoid";

export const AddOrgFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  taxDeductible: z.boolean(),
  notes: z.string(),
});

export type AddOrgForm = z.infer<typeof AddOrgFormSchema>;

export const create = (params: AddOrgForm): Organization => ({
  ...params,
  id: nanoid(),
  modified: Date.now(),
});

export const edit = (params: AddOrgForm & { id: string }): Organization => ({
  ...params,
  modified: Date.now(),
});
