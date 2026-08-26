import { z } from "zod";
import { updateUserSchema, type createUserSchema } from "./user.schema.js";
import type { Session, CreateSessionInput } from "./session/session.types.js";
import type { Tokens } from "@/token/token.types.js";

export type CreateUserInput = Omit<
  z.infer<typeof createUserSchema>,
  "password"
> &
  Omit<CreateSessionInput, "userId"> & { passwordHash: string };

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
};

export type CreateUserResult = {
  userId: string;
  email: string;
  sessionId: string;
};

export type PublicUser = {
  id: string;
  name: string;
  username: string;
};

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
