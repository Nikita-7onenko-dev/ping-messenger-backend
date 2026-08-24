import jwt from "jsonwebtoken";
import { randomBytes, createHmac } from "node:crypto";

import { ApiError } from "@/exceptions/ApiError.js";
import { generateRandomToken } from "@/utils/generateRandomToken.js";
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

      if (this.checkAccessPayload(payload)) return payload.userId;
      else throw new Error("Invalid access token payload");
    } catch (err) {
      console.error(err);
      throw ApiError.unauthorized();
    }
  }

  generateRefreshToken() {
    return generateRandomToken();
  }

  hashRefreshToken(token: string) {
    return createHmac("sha256", process.env.JWT_REFRESH_SECRET!)
      .update(token)
      .digest("hex");
  }

  private checkAccessPayload(
    payload: string | jwt.JwtPayload,
  ): payload is jwt.JwtPayload & { userId: string } {
    if (
      typeof payload === "object" &&
      payload !== null &&
      "userId" in payload &&
      typeof payload.userId === "string"
    ) {
      return true;
    }
    return false;
  }
}

const tokenService = new TokenService();
export { tokenService };
