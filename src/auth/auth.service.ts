import bcrypt from "bcrypt";
import { createUserSchema, passwordSchema } from "@/users/user.schema.js";
import { tokenService } from "@/token/token.service.js";
import { geoService } from "@/geo/geo.service.js";
import { userRepository } from "@/users/user.repository.js";
import { authRepository } from "./auth.repository.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { sessionService } from "@/users/session/session.service.js";
import { identifierSchema } from "./auth.schema.js";
import type { LoginInput } from "./auth.types.js";
import { oneTimeTokenService } from "@/one-time-token/one-time-token.service.js";
import { userSettingsService } from "@/users/settings/settings.service.js";
import type { Locale } from "@/users/settings/settings.types.js";
import type { Tokens } from "@/token/token.types.js";

class AuthService {
  async register(
    reqBody: unknown,
    userAgent: string | null,
    ipAddress: string | null,
    locale: Locale,
  ): Promise<Tokens> {
    const userInput = createUserSchema.parse(reqBody);
    const hash = await bcrypt.hash(userInput.password, 12);

    const { refreshToken, refreshTokenHash, expiresAt } =
      tokenService.generateRefreshToken();

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
      locale,
    });

    const accessToken = tokenService.generateAccessToken({
      userId: createUserResult.userId,
      sessionId: createUserResult.sessionId,
    });

    await oneTimeTokenService.createEmailVerifyLink(
      createUserResult.userId,
      createUserResult.email,
      locale,
    );

    return {
      refreshToken,
      accessToken,
    };
  }

  async login({
    identifier,
    password,
    ipAddress,
    userAgent,
  }: LoginInput): Promise<Tokens> {
    const validPassword = passwordSchema.parse(password);
    const validIdentifier = identifierSchema.parse(identifier);

    const { userId, passwordHash: storedPasswordHash } =
      await authRepository.findByIdentifier(validIdentifier);
    const comparingResult = await bcrypt.compare(
      validPassword,
      storedPasswordHash,
    );

    if (!comparingResult) {
      throw ApiError.unauthorized("INVALID_CREDENTIALS");
    }

    const createSessionResult = await sessionService.create(
      userId,
      ipAddress,
      userAgent,
    );

    return { ...createSessionResult };
  }
}

const authService = new AuthService();
export { authService };
