import { z } from "zod";
import type { createUserSchema } from "./user.schema.js";

export type UserInput = Omit<z.infer<typeof createUserSchema>, "password"> & {
  passwordHash: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
};

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
};

export type Session = {
  userAgent: string | null;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  lastUsedAt: Date;
};

export type CreateUserResult = {
  user: User;
  session: {
    lastUsedAt: Date;
  };
};

export type RegistrationResult = {
  user: User;
  session: Session;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export type PublicUser = {
  id: string;
  name: string;
  username: string;
};
