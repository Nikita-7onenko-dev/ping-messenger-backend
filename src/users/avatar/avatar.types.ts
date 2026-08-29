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

export type AvatarFromGallery = Avatar & { isCurrent: boolean };
