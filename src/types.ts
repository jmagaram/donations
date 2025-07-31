import { z } from "zod";

export const IdSchema = z.string().trim().length(21);

export const OrgIdSchema = z.string().trim().length(21);

export const DonationAmountSchema = z.number().min(0);
export const DonationKindSchema = z.enum(["idea", "pledge", "paid"]);
export const DonationNotesSchema = z.string();
export const DonationDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date in YYYY-MM-DD format");
export const TimestampSchema = z.number().min(0);

export const OrgNameSchema = z.string().trim().min(1);
export const OrgTaxDeductibleSchema = z.boolean();
export const OrgWebSiteSchema = z.url().optional();
export const OrgNotesSchema = z.string();

export const OrgSchema = z.object({
  id: IdSchema,
  name: OrgNameSchema,
  taxDeductible: OrgTaxDeductibleSchema,
  webSite: OrgWebSiteSchema,
  notes: OrgNotesSchema,
});

export type Org = z.infer<typeof OrgSchema>;

export const DonationSchema = z.object({
  id: IdSchema,
  orgId: OrgIdSchema,
  timestamp: TimestampSchema,
  amount: DonationAmountSchema,
  kind: DonationKindSchema,
  notes: DonationNotesSchema,
});

export type Donation = z.infer<typeof DonationSchema>;

export const DonationsDataSchema = z.object({
  orgs: z.array(OrgSchema),
  donations: z.array(DonationSchema),
});

export type DonationsData = z.infer<typeof DonationsDataSchema>;
