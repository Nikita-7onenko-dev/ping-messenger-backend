import type { User } from "../user.types.js";

export type AvatarTransformations = {
  x: number;
  y: number;
  size: number;
  flipHorizontal: boolean;
};

export type AvatarVariant = "original" | "profile" | "thumbnail";

export type UserAvatar =
  | { avatarId: null }
  | {
      avatarId: string;
      publicId: string;
      transformations: AvatarTransformations;
    };

export type UserWithAvatar = User & UserAvatar;
