import { z } from "zod";
import {
  OrgIdSchema,
  DonationAmountSchema,
  DonationKindSchema,
  DonationNotesSchema,
  DonationPaymentMethodSchema,
} from "./types";
import { DateIsoSchema, getCurrentDateIso } from "./date";

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
