import { z } from "zod";
import {
  OrgNameSchema,
  OrgCategorySchema,
  OrgTaxDeductibleSchema,
  OrgWebSiteSchema,
  OrgNotesSchema,
} from "./types";

export const OrgUpsertFieldsSchema = z.object({
  name: OrgNameSchema.min(1, "Name is required"),
  category: OrgCategorySchema.or(z.literal("")),
  taxDeductible: OrgTaxDeductibleSchema,
  webSite: OrgWebSiteSchema.or(z.literal("")),
  notes: OrgNotesSchema,
});

export type OrgUpsertFields = z.infer<typeof OrgUpsertFieldsSchema>;

export const defaultFields: OrgUpsertFields = {
  name: "",
  category: "",
  taxDeductible: true,
  webSite: "",
  notes: "",
};
