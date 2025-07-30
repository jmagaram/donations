import { z } from "zod";
import { type Organization } from "./types";
import { nanoid } from "nanoid";

export const AddOrganizationFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  taxDeductible: z.boolean(),
  notes: z.string(),
});

export type AddOrganizationForm = z.infer<typeof AddOrganizationFormSchema>;

export const create = (params: AddOrganizationForm): Organization => ({
  ...params,
  id: nanoid(),
  modified: Date.now(),
});
