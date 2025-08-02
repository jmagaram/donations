import { z } from "zod";
import { DateIsoSchema } from "./date";

export const IdSchema = z.string().trim().length(21);

export const OrgIdSchema = z.string().trim().length(21);

export const DonationAmountSchema = z.number();
export const DonationKindSchema = z.enum(["idea", "pledge", "paid", "unknown"]);
export const DonationNotesSchema = z.string();
export const DonationPaymentMethodSchema = z.string().optional();

export const OrgNameSchema = z.string().trim().min(1);
export const OrgCategorySchema = z.string().trim().optional();
export const OrgTaxDeductibleSchema = z.boolean();
export const OrgWebSiteSchema = z.url().optional();
export const OrgNotesSchema = z.string();

export const OrgSchema = z.object({
  id: IdSchema,
  name: OrgNameSchema,
  category: OrgCategorySchema,
  taxDeductible: OrgTaxDeductibleSchema,
  webSite: OrgWebSiteSchema,
  notes: OrgNotesSchema,
});

export type Org = z.infer<typeof OrgSchema>;

export const DonationSchema = z.object({
  id: IdSchema,
  orgId: OrgIdSchema,
  date: DateIsoSchema,
  amount: DonationAmountSchema,
  kind: DonationKindSchema,
  notes: DonationNotesSchema,
  paymentMethod: DonationPaymentMethodSchema,
});

export type Donation = z.infer<typeof DonationSchema>;

export const DonationsDataSchema = z.object({
  orgs: z.array(OrgSchema),
  donations: z.array(DonationSchema),
});

export type DonationsData = z.infer<typeof DonationsDataSchema>;
