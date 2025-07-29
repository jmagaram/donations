import { z } from "zod";

export const OrganizationSchema = z.object({
  id: z.string().trim().length(21),
  name: z.string().trim().min(1),
  taxDeductible: z.boolean(),
  notes: z.string(),
  modified: z.number().min(0),
});

export type Organization = z.infer<typeof OrganizationSchema>;

export const DonationsDataSchema = z.object({
  organizations: z.array(OrganizationSchema),
});

export type DonationsData = z.infer<typeof DonationsDataSchema>;
