import { z } from "zod";
import { type Org } from "./types";
import { nanoid } from "nanoid";

export const OrgAddFormFieldsSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  taxDeductible: z.boolean(),
  notes: z.string(),
});

export type OrgAddFormFields = z.infer<typeof OrgAddFormFieldsSchema>;

export const defaultFormFields: OrgAddFormFields = {
  name: "",
  taxDeductible: true,
  notes: "",
};

export const create = (params: OrgAddFormFields): Org => ({
  ...params,
  id: nanoid(),
  modified: Date.now(),
});

export const edit = (params: OrgAddFormFields & { id: string }): Org => ({
  ...params,
  modified: Date.now(),
});
