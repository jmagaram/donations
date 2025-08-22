import { z } from "zod";
import {
  DateIsoSchema,
  extractYear,
  getCurrentDateIso,
  isOlderThanDays,
  isFutureDate,
} from "./date";
import { IdSchema } from "./nanoId";
import { OrgIdSchema } from "./organization";
import type { AmountFilter } from "./amountFilter";
import type { Org } from "./organization";

export const DonationAmountSchema = z.number();
export const DonationKindSchema = z.enum(["idea", "pledge", "paid"]);
export const DonationNotesSchema = z.string();
export const DonationPaymentMethodSchema = z.string().optional();

export type DonationKind = z.infer<typeof DonationKindSchema>;

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

export const matchesYearFilter = (
  donation: Donation,
  yearFrom: number,
  yearTo: number
): boolean => {
  const year = extractYear(donation.date);
  return year >= yearFrom && year <= yearTo;
};

export const matchesAmountFilter = (
  donation: Donation,
  amountFilter: AmountFilter
): boolean => {
  const amt = donation.amount;
  switch (amountFilter.kind) {
    case "all":
      return true;
    case "moreThan":
      return amt >= amountFilter.min;
    case "lessThan":
      return amt <= amountFilter.max;
    case "between":
      return amt >= amountFilter.min && amt <= amountFilter.max;
  }
};

export const requiresWarning = (
  donation: Pick<Donation, "kind" | "date">
): boolean => {
  const now = getCurrentDateIso();
  const other = donation.date;
  const isOldPledge =
    donation.kind === "pledge" &&
    isOlderThanDays({ now, other, toleranceDays: 90 });
  const isOldIdea =
    donation.kind === "idea" &&
    isOlderThanDays({ now, other, toleranceDays: 90 });
  const isFuturePaid = donation.kind === "paid" && isFutureDate({ now, other });
  return isOldPledge || isOldIdea || isFuturePaid;
};

export const sortByDateDesc = (a: Donation, b: Donation): number =>
  b.date.localeCompare(a.date);

export const sortByAmountDesc = (a: Donation, b: Donation): number =>
  b.amount - a.amount;

export const sortByCategoryAZ = (
  a: Donation,
  b: Donation,
  orgMap: Map<string, Org>
): number => {
  const orgA = orgMap.get(a.orgId);
  const orgB = orgMap.get(b.orgId);
  const catA = (orgA?.category || "").toLowerCase();
  const catB = (orgB?.category || "").toLowerCase();
  const cmp = catA.localeCompare(catB);
  if (cmp !== 0) return cmp;
  return sortByDateDesc(a, b);
};
