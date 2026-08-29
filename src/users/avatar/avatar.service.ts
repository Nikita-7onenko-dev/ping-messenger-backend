import cloudinary from "@/config/cloudinary.js";
import { avatarRepository } from "./avatar.repository.js";
import { avatarTransformationsSchema } from "./avatar.schema.js";
import { validateCloudinaryWebhook } from "@/webhook/webhook.schema.js";
import { buildAvatar } from "./build-avatar.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { avatarDestroy } from "./avatar.destroy.js";

class AvatarService {
  async upload(userId: string, reqBody: unknown) {
    const transformations = avatarTransformationsSchema.parse(reqBody);
    const json = JSON.stringify(transformations);

    const { avatarId } = await avatarRepository.preload(userId, json);

    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = {
      public_id: `Ping/avatars/${avatarId}`,
      asset_folder: "Ping/avatars",
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      signature,
      timestamp,
      public_id: paramsToSign.public_id,
      api_key: process.env.CLOUDINARY_API_KEY!,
      asset_folder: "Ping/avatars",
    };
  }

  async completeUpload(reqBody: unknown) {
    const { avatarId, publicId } = validateCloudinaryWebhook(reqBody);
    const isSuccess = await avatarRepository.completeUpload(avatarId, publicId);
    if (!isSuccess) {
      console.error(`Avatar not found for Cloudinary webhook: ${avatarId}`);
    }
  }

  async getGallery(userId: string) {
    const gallery = await avatarRepository.getGallery(userId);
    return gallery.map((avatar) => ({
      ...buildAvatar({
        avatarId: avatar.avatarId,
        publicId: avatar.publicId,
        transformations: avatar.transformations,
        variant: "cropped",
      }),
      isCurrent: avatar.isCurrent,
    }));
  }

  async delete(userId: string, avatarId: string) {
    const avatar = await avatarRepository.getByIdForUser(userId, avatarId);
    if (!avatar) throw ApiError.notFound("AVATAR_NOT_FOUND");

    await avatarDestroy(avatar.publicId);
    await avatarRepository.delete(userId, avatarId);
  }
}

const avatarService = new AvatarService();
export { avatarService };
