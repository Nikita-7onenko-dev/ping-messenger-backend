import { z } from "zod";
import type { createUserSchema } from "./user.schema.js";

export type CreateUserInput = Omit<
  z.infer<typeof createUserSchema>,
  "password"
> & {
  passwordHash: string;
};

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
};

export type PublicUser = {
  id: string;
  name: string;
  username: string;
};
