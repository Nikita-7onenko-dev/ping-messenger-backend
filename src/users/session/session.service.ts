import { tokenService } from "@/token/token.service.js";
import { sessionRepository } from "./session.repository.js";
import { geoService } from "@/geo/geo.service.js";
import { ApiError } from "@/exceptions/ApiError.js";
import type { Tokens } from "@/token/token.types.js";
import { isExpired } from "@/common/time/isExpired.js";
import type { Session } from "./session.types.js";

class SessionService {
  async create(
    userId: string,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<Tokens> {
    const { refreshToken, refreshTokenHash, expiresAt } =
      tokenService.generateRefreshToken();

    const geoLocation = await geoService.getGeoLocation(ipAddress);

    const sessionId = await sessionRepository.create({
      userId,
      refreshTokenHash,
      expiresAt,
      userAgent,
      ipAddress,
      ...geoLocation,
    });

    const accessToken = tokenService.generateAccessToken({
      userId,
      sessionId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<Tokens> {
    const hashFromClient = tokenService.hashRefreshToken(refreshToken);
    const session =
      await sessionRepository.getByRefreshTokenHash(hashFromClient);

    if (!session || isExpired(session.expiresAt)) {
      throw ApiError.unauthorized();
    }

    const accessToken = tokenService.generateAccessToken({
      userId: session.userId,
      sessionId: session.id,
    });
    return { accessToken, refreshToken };
  }

  async getAll(userId: string, sessionId: string) {
    const sessions = await sessionRepository.getAll(userId);
    return sessions.map((session) => ({
      ...session,
      current: sessionId === session.id,
    }));
  }

  async updateMetadata(
    sessionId: string,
    ipAddress: string | null,
    userAgent: string | null,
  ) {
    const geoLocation = await geoService.getGeoLocation(ipAddress);
    const isSuccess = await sessionRepository.updateMetadata(sessionId, {
      ipAddress,
      userAgent,
      ...geoLocation,
    });
    if (!isSuccess) throw ApiError.internal();
  }

  async updateLastOnline(sessionId: string) {
    const isSuccess = await sessionRepository.updateLastOnline(sessionId);
    if (!isSuccess) throw ApiError.internal();
  }

  async endById(sessionId: string, userId: string) {
    const isSuccess = await sessionRepository.deleteById(sessionId, userId);
    if (!isSuccess) throw ApiError.notFound("SESSION_NOT_FOUND");
  }

  async endAllExceptCurrent(sessionId: string, userId: string) {
    await sessionRepository.deleteAllExceptCurrent(sessionId, userId);
  }
}

const sessionService = new SessionService();
export { sessionService };
