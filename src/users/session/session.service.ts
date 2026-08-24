import { tokenService } from "@/token/token.service.js";
import { sessionRepository } from "./session.repository.js";
import { geoService } from "@/geo/geo.service.js";
import type { CreateSessionResult } from "./session.types.js";
import { ApiError } from "@/exceptions/ApiError.js";
import type { Tokens } from "@/token/token.types.js";

class SessionService {
  async create(
    userId: string,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<CreateSessionResult> {
    const refreshToken = tokenService.generateRefreshToken();
    const refreshTokenHash = tokenService.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const geoLocation = await geoService.getGeoLocation(ipAddress);

    const session = await sessionRepository.create({
      userId,
      refreshTokenHash,
      expiresAt,
      userAgent,
      ipAddress,
      ...geoLocation,
    });

    const accessToken = tokenService.generateAccessToken({
      userId,
      sessionId: session.id,
    });

    return {
      session: {
        userAgent,
        ipAddress,
        ...session,
        ...geoLocation,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<Tokens> {
    const hashFromClient = tokenService.hashRefreshToken(refreshToken);
    const session =
      await sessionRepository.getByRefreshTokenHash(hashFromClient);

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw ApiError.unauthorized("Invalid or expired token");
    }

    const accessToken = tokenService.generateAccessToken({
      userId: session.userId,
      sessionId: session.id,
    });
    return { accessToken, refreshToken };
  }

  async getAll(userId: string) {
    return await sessionRepository.getAll(userId);
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
    if (!isSuccess) throw ApiError.notFound("Session not found");
  }

  async updateLastOnline(sessionId: string) {
    const isSuccess = await sessionRepository.updateLastOnline(sessionId);
    if (!isSuccess) throw ApiError.notFound("Session not found");
  }

  async endById(sessionId: string, userId: string) {
    const isSuccess = await sessionRepository.deleteById(sessionId, userId);
    if (!isSuccess) throw ApiError.notFound("Session not found");
  }

  async endAllExceptCurrent(sessionId: string, userId: string) {
    await sessionRepository.deleteAllExceptCurrent(sessionId, userId);
  }
}

const sessionService = new SessionService();
export { sessionService };
