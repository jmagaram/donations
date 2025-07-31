import { z } from "zod";
import {
  type Org,
  OrgNameSchema,
  OrgTaxDeductibleSchema,
  OrgWebSiteSchema,
  OrgNotesSchema,
} from "./types";

export const OrgUpsertFieldsSchema = z.object({
  name: OrgNameSchema.min(1, "Name is required"),
  taxDeductible: OrgTaxDeductibleSchema,
  webSite: OrgWebSiteSchema.or(z.literal("")),
  notes: OrgNotesSchema,
});

export type OrgUpsertFields = z.infer<typeof OrgUpsertFieldsSchema>;

export const defaultFields: OrgUpsertFields = {
  name: "",
  taxDeductible: true,
  webSite: "",
  notes: "",
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
