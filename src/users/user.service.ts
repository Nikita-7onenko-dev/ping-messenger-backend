import { validateUser } from "./user.schema.js";
import bcrypt from "bcrypt";
import { userRepository } from "./user.repository.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { tokenService } from "@/token/token.service.js";

class UserService {
  async register(reqBody: unknown) {
    const userInput = validateUser(reqBody);
    const hash = await bcrypt.hash(userInput.password, 12);

    const refreshToken = tokenService.generateRefreshToken();
    const refreshTokenHash = tokenService.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const user = await userRepository.create({
      name: userInput.name,
      username: userInput.username,
      email: userInput.email,
      passwordHash: hash,
      refreshTokenHash,
      expiresAt,
    });

    const accessToken = tokenService.generateAccessToken({ userId: user.id });

    return { user, refreshToken, accessToken };
  }

  async getByUsername(username: string) {
    const user = await userRepository.getByUsername(username);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user;
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
