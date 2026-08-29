import { zodError } from "@/common/validation/zodError.js";
import { z } from "zod";

export const nameSchema = z.string().min(1, zodError("REQUIRED"));
export const usernameSchema = z.string().min(1, zodError("REQUIRED"));
export const emailSchema = z.email(zodError("INVALID_EMAIL"));
export const passwordSchema = z.string().min(8, zodError("TOO_SHORT"));
export const idSchema = z.uuid();

export const createUserSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const updateUserSchema = z
  .object({
    name: nameSchema.optional(),
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
  })
  .refine(
    (updateData) =>
      Object.values(updateData).some((value) => value !== undefined),
    zodError("AT_LEAST_ONE_FIELD_REQUIRED"),
  );
