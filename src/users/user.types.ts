import { z } from "zod";
import { updateUserSchema, type createUserSchema } from "./user.schema.js";
import type { CreateSessionInput } from "./session/session.types.js";
import type { UserSettings } from "./settings/settings.types.js";
import type { Avatar, AvatarRow } from "./avatar/avatar.types.js";

//  DB inputs
export type CreateUserInput = Omit<
  z.infer<typeof createUserSchema>,
  "password"
> &
  Omit<CreateSessionInput, "userId"> & { passwordHash: string } & UserSettings;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// DB projections
export type UserRow = {
  id: string;
  name: string;
  username: string;
  email: string;
} & AvatarRow;

export type CreateUserResultRow = {
  userId: string;
  email: string;
  sessionId: string;
};

export type PublicUserRow = {
  id: string;
  name: string;
  username: string;
  lastOnlineAt: Date;
} & AvatarRow;

//  Domain/API models
export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: Avatar;
};

export type PublicUser = {
  id: string;
  name: string;
  username: string;
  lastOnlineAt: Date;
  avatar: Avatar;
};
