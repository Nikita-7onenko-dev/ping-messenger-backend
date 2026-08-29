import cloudinary from "@/config/cloudinary.js";
import type { AvatarTransformations, AvatarVariant } from "./avatar.types.js";
import type { TransformationOptions } from "cloudinary";

const avatarVariants: Record<
  Exclude<AvatarVariant, "cropped">,
  TransformationOptions
> = {
  profile: {
    width: 350,
    height: 350,
    crop: "fill",
  },
  thumbnail: {
    width: 64,
    height: 64,
    crop: "fill",
    radius: "max",
  },
};

function buildAvatarUrl(
  publicId: string,
  transformations: AvatarTransformations,
  variant: AvatarVariant,
) {
  const userTransformations: TransformationOptions = {
    width: transformations.size,
    height: transformations.size,
    x: transformations.x,
    y: transformations.y,
    flipHorizontal: transformations.flipHorizontal,
    crop: "crop",
  };

  const variantTransformation =
    variant === "cropped" ? undefined : avatarVariants[variant];

  return cloudinary.url(publicId, {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    transformation: [
      userTransformations,
      ...(variantTransformation ? [variantTransformation] : []),
    ],
  });
}

type BuildAvatarInput =
  | {
      avatarId: string;
      publicId: null;
      transformations: null;
      variant: null;
    }
  | {
      avatarId: string;
      publicId: string;
      transformations: AvatarTransformations;
      variant: AvatarVariant;
    };

export function buildAvatar({
  avatarId,
  publicId,
  transformations,
  variant,
}: BuildAvatarInput) {
  if (!publicId) {
    return {
      id: avatarId,
      url: null,
      status: "pending",
    };
  }

  return {
    id: avatarId,
    url: buildAvatarUrl(publicId, transformations, variant),
    status: "ready",
  };
}
