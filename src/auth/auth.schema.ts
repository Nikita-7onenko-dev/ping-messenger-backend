import { ApiError } from "@/exceptions/ApiError.js";
import { emailSchema, usernameSchema } from "@/users/user.schema.js";
import { z } from "zod";

export const identifierSchema = emailSchema.or(usernameSchema);
const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);

export function validateToken(token: unknown) {
  try {
    return tokenSchema.parse(token);
  } catch (err) {
    throw ApiError.unauthorized("INVALID_CREDENTIALS");
  }
}
