import { z } from "zod";
import type { createUserSchema } from "./user.schema.js";

export type UserInput = Omit<z.infer<typeof createUserSchema>, "password"> & {
  passwordHash: string;
  refreshTokenHash: string;
  expiresAt: Date;
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
