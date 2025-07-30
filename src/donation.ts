import { z } from "zod";
import { type Donation } from "./types";
import { nanoid } from "nanoid";

export const DonationUpsertFieldsSchema = z.object({
  orgId: z.string().trim().length(21),
  timestamp: z.number().min(0),
  amount: z.number().min(0),
  kind: z.enum(["idea", "pledge", "paid"]),
  notes: z.string(),
});

export type DonationUpsertFields = z.infer<typeof DonationUpsertFieldsSchema>;

export const defaultFields: DonationUpsertFields = {
  orgId: "",
  timestamp: Date.now(),
  amount: 0,
  kind: "paid",
  notes: "",
};

export const createDonation = (params: DonationUpsertFields): Donation => ({
  ...params,
  id: nanoid(),
  modified: Date.now(),
});

export const editDonation = (
  params: DonationUpsertFields & { id: string }
): Donation => ({
  ...params,
  modified: Date.now(),
});

export const recency = (donation: Donation): number =>
  Math.max(donation.modified, donation.timestamp);

// Amount match $5400.24
// Timestamp: January 1, 2024
// Kind: pledge
// Notes: Event at Dena's house
// Pledge Dena - is this an AND or an OR?
// Amount > $1000 or < $500
// Date between 2024 and 2025
// export const textMatch = (donation: Donation, filter: string): boolean => {
//   return true;
// };
