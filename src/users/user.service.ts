import { userRepository } from "./user.repository.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { updateUserSchema } from "./user.schema.js";
import { userSettingsRepository } from "./settings/settings.repository.js";
import { currentAvatarSchema } from "./avatar/avatar.schema.js";

class UserService {
  async getByUsername(username: string) {
    const user = await userRepository.getByUsername(username);
    if (!user) {
      throw ApiError.notFound("USER_NOT_FOUND");
    }
    return user;
  }

  async getMe(id: string) {
    const user = await userRepository.getById(id);
    if (!user) throw ApiError.internal("Authenticated user not found");
    const settings = await userSettingsRepository.getSettings(id);
    if (!settings) {
      throw ApiError.internal(`Related user ${id}: settings not found`);
    }
    return { ...user, settings };
  }

  async updateMe(id: string, updateData: unknown) {
    const validData = updateUserSchema.parse(updateData);
    const isUpdated = await userRepository.updateById(id, validData);
    if (!isUpdated) throw ApiError.internal("Authenticated user not found");
  }

  async setCurrentAvatar(userId: string, reqBody: unknown) {
    const { avatarId } = currentAvatarSchema.parse(reqBody);
    const isSuccess = await userRepository.setCurrentAvatar(userId, avatarId);
    if (!isSuccess) throw ApiError.notFound();
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
