import { z } from "zod";
import { nanoid } from "nanoid";

export const IdSchema = z.string().trim().length(21);

export const makeId = (): string => nanoid();