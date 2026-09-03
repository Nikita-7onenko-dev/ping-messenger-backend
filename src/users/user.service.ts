import { userRepository } from "./user.repository.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { updateUserSchema } from "./user.schema.js";
import { userSettingsRepository } from "./settings/settings.repository.js";
import { buildAvatarUrl } from "./avatar/build-avatar.js";
import type { PublicUser, User } from "./user.types.js";
import type { UserSettings } from "./settings/settings.types.js";

class UserService {
  async getByUsername(username: string): Promise<PublicUser> {
    const user = await userRepository.getByUsername(username);
    if (!user) {
      throw ApiError.notFound("USER_NOT_FOUND");
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      lastOnlineAt: user.lastOnlineAt,
      avatar: user.avatarId
        ? {
            id: user.avatarId,
            url: buildAvatarUrl(user.avatarId, user.transformations, "cropped"),
          }
        : null,
    };
  }

  async getMe(id: string): Promise<{ user: User; settings: UserSettings }> {
    const user = await userRepository.getById(id);
    if (!user) throw ApiError.internal("Authenticated user not found");
    const settings = await userSettingsRepository.getSettings(id);
    if (!settings) {
      throw ApiError.internal(`Related user ${id}: settings not found`);
    }

    return {
      user: {
        id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatarId
          ? {
              id: user.avatarId,
              url: buildAvatarUrl(
                user.avatarId,
                user.transformations,
                "profile",
              ),
            }
          : null,
      },
      settings,
    };
  }

  async updateMe(id: string, updateData: unknown) {
    const validData = updateUserSchema.parse(updateData);
    const isUpdated = await userRepository.updateById(id, validData);
    if (!isUpdated) throw ApiError.internal("Authenticated user not found");
  }

  async deleteMe(id: string) {
    const isSuccess = await userRepository.deleteById(id);
    if (!isSuccess) {
      throw ApiError.internal("Authenticated user not found");
    }
  }
}

const userService = new UserService();
export { userService };
