import type { PublicUser, User } from "../user.types.js";

export type AvatarTransformations = {
  x: number;
  y: number;
  size: number;
  flipHorizontal: boolean;
};

export type AvatarVariant = "cropped" | "profile" | "thumbnail";

export type Avatar = {
  avatarId: string;
  publicId: string;
  transformations: AvatarTransformations;
};

export type UserWithAvatar = User & (Avatar | { avatarId: null });

export type PublicUserWithAvatar = PublicUser & (Avatar | { avatarId: null });

export type AvatarFromGallery = Avatar & { isCurrent: boolean };
