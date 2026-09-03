import cloudinary from "@/config/cloudinary.js";
import { avatarRepository } from "./avatar.repository.js";
import {
  avatarTransformationsSchema,
  currentAvatarSchema,
} from "./avatar.schema.js";
import { validateCloudinaryWebhook } from "@/webhook/webhook.schema.js";
import { buildAvatarUrl } from "./build-avatar.js";
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

  async setCurrentAvatar(userId: string, reqBody: unknown) {
    const { avatarId } = currentAvatarSchema.parse(reqBody);
    const isSuccess = await avatarRepository.setCurrentAvatar(userId, avatarId);
    if (!isSuccess) throw ApiError.notFound();
  }

  async completeUpload(reqBody: unknown) {
    const avatarId = validateCloudinaryWebhook(reqBody);
    const isSuccess = await avatarRepository.completeUpload(avatarId);
    if (!isSuccess) {
      console.error(`Avatar not found for Cloudinary webhook: ${avatarId}`);
    }
  }

  async getGallery(userId: string) {
    const gallery = await avatarRepository.getGallery(userId);
    return gallery.map((avatar) => ({
      id: avatar.id,
      url: buildAvatarUrl(avatar.id, avatar.transformations, "cropped"),
      isCurrent: avatar.isCurrent,
    }));
  }

  async delete(userId: string, avatarId: string) {
    const isAvatarExists = await avatarRepository.getByIdForUser(
      userId,
      avatarId,
    );
    if (!isAvatarExists) throw ApiError.notFound("AVATAR_NOT_FOUND");

    const publicId = `Ping/avatars/${avatarId}`;

    await avatarDestroy(publicId);
    await avatarRepository.delete(userId, avatarId);
  }
}

const avatarService = new AvatarService();
export { avatarService };
