export type AvatarTransformations = {
  x: number;
  y: number;
  size: number;
  flipHorizontal: boolean;
};

export type Avatar = {
  id: string;
  publicId: string;
  transformations: AvatarTransformations;
  createdAt: Date;
};
