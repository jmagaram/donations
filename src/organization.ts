import { z } from "zod";
import { IdSchema } from "./nanoId";

export const OrgIdSchema = IdSchema;

export const OrgNameSchema = z.string().trim().min(1);
export const OrgCategorySchema = z.string().trim().optional();
export const OrgTaxDeductibleSchema = z.boolean();
export const OrgArchivedSchema = z.boolean();
export const OrgWebSiteSchema = z
  .union([
    z
      .string()
      .trim()
      .transform((val) => {
        if (val === "") return val;
        if (!/^https?:\/\//.test(val)) {
          return `https://${val}`;
        }
        return val;
      })
      .pipe(
        z.union([
          z.url({
            protocol: /^https?$/,
            hostname: z.regexes.domain,
            normalize: true,
          }),
          z.literal(""),
        ]),
      ),
    z.literal(""),
  ])
  .optional();
export const OrgNotesSchema = z.string();

export const OrgSchema = z.object({
  id: OrgIdSchema,
  name: OrgNameSchema,
  category: OrgCategorySchema,
  taxDeductible: OrgTaxDeductibleSchema,
  archived: OrgArchivedSchema,
  webSite: OrgWebSiteSchema,
  notes: OrgNotesSchema,
});

export type Org = z.infer<typeof OrgSchema>;

export const OrgUpsertFieldsSchema = z.object({
  name: OrgNameSchema.min(1, "Name is required"),
  category: OrgCategorySchema.or(z.literal("")),
  taxDeductible: OrgTaxDeductibleSchema,
  archived: OrgArchivedSchema,
  webSite: OrgWebSiteSchema.or(z.literal("")),
  notes: OrgNotesSchema,
});

export type OrgUpsertFields = z.infer<typeof OrgUpsertFieldsSchema>;

export const defaultFields: OrgUpsertFields = {
  name: "",
  category: "",
  taxDeductible: true,
  archived: false,
  webSite: "",
  notes: "",
};
