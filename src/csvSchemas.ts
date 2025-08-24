import { z } from "zod";
import { OrgNameSchema, OrgNotesSchema } from "./organization";
import { DateIsoSchema } from "./date";
import {
  DonationAmountSchema,
  DonationKindSchema,
  DonationNotesSchema,
  DonationPaymentMethodSchema,
} from "./donation";

export const OrgRowCsvSchema = z.object({
  OrgName: OrgNameSchema,
  Category: z.string(),
  TaxDeductible: z.enum(["Yes", "yes", "No", "no"]),
  Archived: z.enum(["Yes", "yes", "No", "no"]),
  WebSite: z.string(),
  Notes: OrgNotesSchema,
});

export type OrgRowCsv = z.infer<typeof OrgRowCsvSchema>;

export const DonationRowExportCsvSchema = z.object({
  Name: OrgNameSchema,
  Category: z.string(),
  TaxDeductible: z.enum(["Yes", "yes", "No", "no"]),
  Date: DateIsoSchema,
  Year: z.string(),
  Amount: DonationAmountSchema,
  Kind: DonationKindSchema,
  PaymentMethod: DonationPaymentMethodSchema,
  Notes: DonationNotesSchema,
});

export type DonationRowExportCsv = z.infer<typeof DonationRowExportCsvSchema>;

export const DonationRowImportCsvSchema = z.object({
  Name: OrgNameSchema,
  Date: DateIsoSchema,
  Amount: z
    .string()
    .transform((val) => {
      const parsed = parseFloat(val);
      if (!isFinite(parsed)) {
        throw new Error("Invalid amount format");
      }
      return parsed;
    })
    .pipe(DonationAmountSchema),
  Kind: DonationKindSchema,
  PaymentMethod: z.string().optional().default(""),
  Notes: z.string().optional().default(""),
});

export type DonationRowImportCsv = z.infer<typeof DonationRowImportCsvSchema>;
