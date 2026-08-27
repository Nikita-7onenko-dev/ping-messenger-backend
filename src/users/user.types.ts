import { z } from "zod";
import { updateUserSchema, type createUserSchema } from "./user.schema.js";
import type { CreateSessionInput } from "./session/session.types.js";
import type { UserSettings } from "./settings/settings.types.js";

export type CreateUserInput = Omit<
  z.infer<typeof createUserSchema>,
  "password"
> &
  Omit<CreateSessionInput, "userId"> & { passwordHash: string } & UserSettings;

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
