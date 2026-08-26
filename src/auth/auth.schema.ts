import { emailSchema, usernameSchema } from "@/users/user.schema.js";
import { z } from "zod";

export const identifierSchema = emailSchema.or(usernameSchema);
export const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
