import type { Avatar, AvatarTransformations } from "../avatar/avatar.types.js";

export type Contact = {
  userId: string;
  name: string;
  lastOnlineAt: Date;
} & (Avatar | { avatarId: null });
