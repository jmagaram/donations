import { z } from "zod";
import {
  type Donation,
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


export const donationTextMatch = (
  filter: string,
  donation: Donation,
  org: { name: string; notes: string }
): boolean => {
  const getWords = (text: string): string[] =>
    text.toLowerCase().split(/[ ,]+/);
  const filterWords = getWords(filter);
  if (filterWords.length === 0) return true;
  const targetWords = [
    ...getWords(donation.notes),
    donation.kind.toLowerCase(),
    ...getWords(org.name),
    ...getWords(org.notes),
    ...getWords(donation.paymentMethod || ""),
  ];
  return filterWords.some((fw) => targetWords.some((tw) => tw.includes(fw)));
};
