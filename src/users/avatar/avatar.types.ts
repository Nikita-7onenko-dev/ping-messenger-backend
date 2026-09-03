export type AvatarTransformations = {
  x: number;
  y: number;
  size: number;
  flipHorizontal: boolean;
};

export type AvatarVariant = "cropped" | "profile" | "thumbnail";

export type AvatarRow =
  | {
      avatarId: string;
      transformations: AvatarTransformations;
    }
  | {
      avatarId: null;
      transformations: null;
    };

export type GalleryItem = {
  id: string;
  transformations: AvatarTransformations;
  isCurrent: boolean;
};

export type Avatar = {
  id: string;
  url: string;
} | null;
