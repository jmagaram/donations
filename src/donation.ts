import { z } from "zod";
import { type Donation } from "./types";
import { nanoid } from "nanoid";

export const DonationUpsertFieldsSchema = z.object({
  orgId: z.string().trim().length(21),
  date: z.string().min(10), // YYYY-MM-DD
  amount: z.number().min(0),
  kind: z.enum(["idea", "pledge", "paid"]),
  notes: z.string(),
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
  modified: Date.now(),
});

export const editDonation = (
  params: DonationUpsertFields & { id: string }
): Donation => ({
  ...params,
  timestamp: new Date(params.date).getTime(),
  modified: Date.now(),
});

export const recency = (donation: Donation): number =>
  Math.max(donation.modified, donation.timestamp);

const FILLER_WORDS = new Set([
  "the",
  "a",
  "an",
  "to",
  "and",
  "of",
  "in",
  "at",
  "on",
  "for",
  "with",
  "by",
  "is",
  "it",
]);

/**
 * Returns true if any filter word (ignoring filler words) is a substring of any target word from donation fields.
 * @param donation The donation object
 * @param filter The filter string (e.g. "pledge party")
 */
export const donationTextMatch = (
  donation: Donation,
  filter: string
): boolean => {
  function getWords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[ ,]+/)
      .filter((w) => w && !FILLER_WORDS.has(w));
  }

  const filterWords = getWords(filter);
  if (filterWords.length === 0) return true;

  const targetWords = [
    ...getWords(donation.notes),
    donation.kind.toLowerCase(),
  ];

  return filterWords.some((fw) => targetWords.some((tw) => tw.includes(fw)));
};
