import { z } from "zod";

export const OrgSchema = z.object({
  id: z.string().trim().length(21),
  name: z.string().trim().min(1),
  taxDeductible: z.boolean(),
  notes: z.string(),
  modified: z.number().min(0),
});

export type Org = z.infer<typeof OrgSchema>;

export const DonationsDataSchema = z.object({
  orgs: z.array(OrgSchema),
});

export type DonationsData = z.infer<typeof DonationsDataSchema>;
