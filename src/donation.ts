import { z } from "zod";
import { type Donation, OrgIdSchema, DonationAmountSchema, DonationKindSchema, DonationNotesSchema, DonationDateSchema } from "./types";
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
  date: new Date().toISOString().slice(0, 10),
  amount: 0,
  kind: "paid",
  notes: "",
};

export const createDonation = (params: DonationUpsertFields): Donation => ({
  ...params,
  timestamp: new Date(params.date).getTime(),
  id: nanoid(),
});

export const editDonation = (
  params: DonationUpsertFields & { id: string }
): Donation => ({
  ...params,
  timestamp: new Date(params.date).getTime(),
});

export const recency = (donation: Donation): number => donation.timestamp;

/**
 * Returns true if any filter word (ignoring filler words) is a substring of any target word from donation or org fields.
 * @param filter The filter string (e.g. "university of washington")
 * @param donation The donation object
 * @param org The organization object corresponding to the donation
 */
export function donationTextMatch(
  filter: string,
  donation: Donation,
  org: { name: string; notes: string }
): boolean {
  function getWords(text: string): string[] {
    return text.toLowerCase().split(/[ ,]+/);
  }

  const filterWords = getWords(filter);
  if (filterWords.length === 0) return true;

  const targetWords = [
    ...getWords(donation.notes),
    donation.kind.toLowerCase(),
    ...getWords(org.name),
    ...getWords(org.notes),
  ];

  return filterWords.some((fw) => targetWords.some((tw) => tw.includes(fw)));
}
