import { ApiError } from "@/exceptions/ApiError.js";
import { idSchema } from "@/users/user.schema.js";
import z from "zod";

const cloudinaryAvatarWebhookSchema = z.object({
  public_id: z.string().regex(/^Ping\/avatars\/[0-9a-fA-F-]{36}$/),
});

export function validateCloudinaryWebhook(reqBody: unknown) {
  const meta = cloudinaryAvatarWebhookSchema.parse(reqBody);

  const [namespace, folder, avatarId] = meta.public_id.split("/");

  if (namespace !== "Ping" || folder !== "avatars") {
    throw ApiError.forbidden();
  }

  const validAvatarId = idSchema.parse(avatarId);
  return validAvatarId;
}
