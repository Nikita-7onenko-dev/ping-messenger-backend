import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.email("Invalid email format"),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long" }),
});

export function validateUser(reqBody: unknown) {
  return createUserSchema.parse(reqBody);
}
