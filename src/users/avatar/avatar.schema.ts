import { zodError } from "@/common/validation/zodError.js";
import z from "zod";
import { idSchema } from "../user.schema.js";

export const avatarTransformationsSchema = z.object({
  x: z
    .number()
    .min(0, zodError("BAD_REQUEST"))
    .max(10000, zodError("BAD_REQUEST")),
  y: z
    .number()
    .min(0, zodError("BAD_REQUEST"))
    .max(10000, zodError("BAD_REQUEST")),
  size: z.number().min(30).max(10000, zodError("BAD_REQUEST")),
  flipHorizontal: z.boolean(zodError("BAD_REQUEST")),
});

export const avatarIdSchema = idSchema.or(z.null());

export const currentAvatarSchema = z.object({
  avatarId: avatarIdSchema,
});
