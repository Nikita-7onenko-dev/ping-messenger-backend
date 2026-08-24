import bcrypt from "bcrypt";
import { userRepository } from "./user.repository.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { tokenService } from "@/token/token.service.js";
import { geoService } from "@/geo/geo.service.js";
import type { RegistrationResult } from "./user.types.js";
import { createUserSchema, updateUserSchema } from "./user.schema.js";

class UserService {
  async register(
    reqBody: unknown,
    userAgent: string | null,
    ipAddress: string | null,
  ): Promise<RegistrationResult> {
    const userInput = createUserSchema.parse(reqBody);
    const hash = await bcrypt.hash(userInput.password, 12);

    const refreshToken = tokenService.generateRefreshToken();
    const refreshTokenHash = tokenService.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const geoLocation = await geoService.getGeoLocation(ipAddress);

    const createUserResult = await userRepository.create({
      name: userInput.name,
      username: userInput.username,
      email: userInput.email,
      passwordHash: hash,
      refreshTokenHash,
      expiresAt,
      userAgent,
      ipAddress,
      ...geoLocation,
    });

    const accessToken = tokenService.generateAccessToken({
      userId: createUserResult.user.id,
      sessionId: createUserResult.session.id,
    });

    return {
      user: createUserResult.user,
      session: {
        ...createUserResult.session,
        userAgent,
        ipAddress,
        ...geoLocation,
      },
      tokens: {
        refreshToken,
        accessToken,
      },
    };
  }

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
