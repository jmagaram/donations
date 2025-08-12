import { z } from "zod";
import { DateIsoSchema, getCurrentDateIso } from "./date";
import { IdSchema } from "./nanoId";
import { OrgIdSchema } from "./organization";

export const DonationAmountSchema = z.number();
export const DonationKindSchema = z.enum(["idea", "pledge", "paid", "unknown"]);
export const DonationNotesSchema = z.string();
export const DonationPaymentMethodSchema = z.string().optional();

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

export const DonationUpsertFieldsSchema = z.object({
  orgId: OrgIdSchema.min(1, "Please select an organization"),
  date: DateIsoSchema,
  amount: DonationAmountSchema,
  kind: DonationKindSchema,
  notes: DonationNotesSchema,
  paymentMethod: DonationPaymentMethodSchema,
});

export type DonationUpsertFields = z.infer<typeof DonationUpsertFieldsSchema>;

export const defaultFields: DonationUpsertFields = {
  orgId: "",
  date: getCurrentDateIso(),
  amount: 0,
  kind: "paid",
  notes: "",
  paymentMethod: "",
};
