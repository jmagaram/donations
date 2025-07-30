import { z } from "zod";
import { type Organization } from "./types";
import { nanoid } from "nanoid";

export const AddOrgFormFieldsSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  taxDeductible: z.boolean(),
  notes: z.string(),
});

export type AddOrgFormFields = z.infer<typeof AddOrgFormFieldsSchema>;

export const defaultFormFields: AddOrgFormFields = {
  name: "",
  taxDeductible: true,
  notes: "",
};

export const create = (params: AddOrgFormFields): Organization => ({
  ...params,
  id: nanoid(),
  modified: Date.now(),
});

export const edit = (
  params: AddOrgFormFields & { id: string }
): Organization => ({
  ...params,
  modified: Date.now(),
});
