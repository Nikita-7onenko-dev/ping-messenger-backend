import jwt from "jsonwebtoken";
import { randomBytes, createHmac } from "node:crypto";

import { ApiError } from "@/exceptions/ApiError.js";
import { generateRandomToken } from "@/common/crypto/generateRandomToken.js";
import type { AccessTokenPayload } from "./token.types.js";

class TokenService {
  generateAccessToken(payload: AccessTokenPayload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "30m",
    });

    return accessToken;
  }

  verifyAccessToken(token: string) {
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);

      if (this.checkAccessPayload(payload)) return payload;
      else throw new Error("Invalid access token payload");
    } catch (err) {
      console.error(err);
      throw ApiError.unauthorized();
    }
  }

  generateRefreshToken() {
    const refreshToken = generateRandomToken();
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    return {
      refreshToken,
      refreshTokenHash,
      expiresAt,
    };
  }

  hashRefreshToken(token: string) {
    return createHmac("sha256", process.env.JWT_REFRESH_SECRET!)
      .update(token)
      .digest("hex");
  }

  private checkAccessPayload(
    payload: string | jwt.JwtPayload,
  ): payload is jwt.JwtPayload & AccessTokenPayload {
    if (
      typeof payload === "object" &&
      payload !== null &&
      "userId" in payload &&
      typeof payload.userId === "string" &&
      "sessionId" in payload &&
      typeof payload.sessionId === "string"
    ) {
      return true;
    }
    return false;
  }
}

const tokenService = new TokenService();
export { tokenService };
