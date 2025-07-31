import { z } from "zod";

export const IdSchema = z.string().trim().length(21);

export const OrgIdSchema = z.string().trim().length(21);

export const OrgSchema = z.object({
  id: IdSchema,
  name: z.string().trim().min(1),
  taxDeductible: z.boolean(),
  webSite: z.url().optional(),
  notes: z.string(),
});

export type Org = z.infer<typeof OrgSchema>;

export const DonationSchema = z.object({
  id: IdSchema,
  orgId: OrgIdSchema,
  timestamp: z.number().min(0),
  amount: z.number().min(0),
  kind: z.enum(["idea", "pledge", "paid"]),
  notes: z.string(),
});

export type Donation = z.infer<typeof DonationSchema>;

export const DonationsDataSchema = z.object({
  orgs: z.array(OrgSchema),
  donations: z.array(DonationSchema),
});

export type DonationsData = z.infer<typeof DonationsDataSchema>;
