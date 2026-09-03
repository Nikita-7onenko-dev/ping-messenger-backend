import type { Avatar, AvatarRow } from "../avatar/avatar.types.js";

export type ContactRow = {
  userId: string;
  name: string;
  lastOnlineAt: Date;
} & AvatarRow;

export type Contact = {
  userId: string;
  name: string;
  lastOnlineAt: Date;
  avatar: Avatar;
};
