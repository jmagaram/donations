import { type Organization } from "./types";
import { nanoid } from "nanoid";

export const create = (
  params: Omit<Organization, "id" | "modified">
): Organization => ({
  ...params,
  id: nanoid(),
  modified: Date.now(),
});
