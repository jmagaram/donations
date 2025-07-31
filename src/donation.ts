import { z } from "zod";
import {
  type Donation,
  OrgIdSchema,
  DonationAmountSchema,
  DonationKindSchema,
  DonationNotesSchema,
  DonationDateSchema,
} from "./types";
import { nanoid } from "nanoid";

export const DonationUpsertFieldsSchema = z.object({
  orgId: OrgIdSchema.min(1, "Please select an organization"),
  date: DonationDateSchema,
  amount: DonationAmountSchema,
  kind: DonationKindSchema,
  notes: DonationNotesSchema,
});

export type DonationUpsertFields = z.infer<typeof DonationUpsertFieldsSchema>;

export const defaultFields: DonationUpsertFields = {
  orgId: "",
  date: new Date(),
  amount: 0,
  kind: "paid",
  notes: "",
};

export const createDonation = (params: DonationUpsertFields): Donation => ({
  ...params,
  timestamp: params.date.getTime(),
  id: nanoid(),
});

export const editDonation = (
  params: DonationUpsertFields & { id: string }
): Donation => ({
  ...params,
  timestamp: params.date.getTime(),
});

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
  ];
  return filterWords.some((fw) => targetWords.some((tw) => tw.includes(fw)));
};
