import { z } from "zod";

const nameSchema = z.string().min(1, { error: "Name cannot be empty" });
const usernameSchema = z.string().min(1, { error: "Username cannot be empty" });
const emailSchema = z.email("Invalid email format");

export const createUserSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long" }),
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
    { error: "At least one field must be provided" },
  );
