import cloudinary from "@/config/cloudinary.js";
import type { AvatarTransformations, AvatarVariant } from "./avatar.types.js";
import type { TransformationOptions } from "cloudinary";

const avatarVariants: Record<
  Exclude<AvatarVariant, "original">,
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

export function buildAvatarUrl(
  publicId: string,
  transformations: AvatarTransformations,
  variant: AvatarVariant,
) {
  const userTransformations: TransformationOptions = {
    width: transformations.size,
    height: transformations.size,
    x: transformations.x,
    y: transformations.y,
    crop: "crop",
  };

  const variantTransformation =
    variant === "original" ? undefined : avatarVariants[variant];

  return cloudinary.url(publicId, {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    transformation: [
      userTransformations,
      ...(variantTransformation ? [variantTransformation] : []),
    ],
  });
}
