import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.email("Invalid email format"),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long" }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
};

export function validateUser(reqBody: unknown) {
  return createUserSchema.parse(reqBody);
}
