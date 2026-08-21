import { validateUser } from "./user.schema.js";
import bcrypt from "bcrypt";
import { userRepository } from "./user.repository.js";
import { ApiError } from "@/exceptions/ApiError.js";

class UserService {
  async register(reqBody: unknown) {
    const validUser = validateUser(reqBody)!;
    const hash = await bcrypt.hash(validUser.password, 12);
    const user = await userRepository.create({
      ...validUser,
      password: hash,
    });
    return user;
  }

  async getByUsername(username: string) {
    const user = await userRepository.getByUsername(username);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user;
  }

  async deleteMe(id: string) {
    const deletedId = await userRepository.deleteById(id);
    if (!deletedId) {
      throw ApiError.notFound("User not found");
    }
  }
}

const userService = new UserService();
export { userService };
