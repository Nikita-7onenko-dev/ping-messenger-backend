import bcrypt from "bcrypt";
import { createUserSchema, passwordSchema } from "@/users/user.schema.js";
import type { RegistrationResult } from "@/users/user.types.js";
import { tokenService } from "@/token/token.service.js";
import { geoService } from "@/geo/geo.service.js";
import { userRepository } from "@/users/user.repository.js";
import { authRepository } from "./auth.repository.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { sessionService } from "@/users/session/session.service.js";
import { identifierSchema } from "./auth.schema.js";
import type { LoginInput } from "./auth.types.js";

class AuthService {
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

  async login({ identifier, password, ipAddress, userAgent }: LoginInput) {
    const validPassword = passwordSchema.parse(password);
    const validIdentifier = identifierSchema.parse(identifier);

    const { user, passwordHash } =
      await authRepository.findByIdentifier(validIdentifier);
    const comparingResult = await bcrypt.compare(validPassword, passwordHash);

    if (!comparingResult) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    const createSessionResult = await sessionService.create(
      user.id,
      ipAddress,
      userAgent,
    );

    return { ...createSessionResult, user };
  }
}

const authService = new AuthService();
export { authService };
