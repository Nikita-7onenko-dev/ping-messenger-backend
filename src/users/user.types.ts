import { z } from "zod";
import type { createUserSchema } from "./user.schema.js";

export type CreateUserInput = z.infer<typeof createUserSchema>;

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
