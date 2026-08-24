import { userRepository } from "./user.repository.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { createUserSchema, updateUserSchema } from "./user.schema.js";

class UserService {
  async getByUsername(username: string) {
    const user = await userRepository.getByUsername(username);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user;
  }

  async getMe(id: string) {
    const user = await userRepository.getById(id);
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  async updateMe(id: string, updateData: unknown) {
    const validData = updateUserSchema.parse(updateData);
    const isUpdated = await userRepository.updateById(id, validData);
    if (!isUpdated) throw ApiError.notFound("User not found");
  }

  async deleteMe(id: string) {
    const isSuccess = await userRepository.deleteById(id);
    if (!isSuccess) {
      throw ApiError.notFound("User not found");
    }
  }
}

const userService = new UserService();
export { userService };
