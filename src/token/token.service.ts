import jwt from "jsonwebtoken";
import { randomBytes, createHmac } from "node:crypto";

import { ApiError } from "@/exceptions/ApiError.js";

type AccessTokenPayload = {
  id: string;
};

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
      return payload;
    } catch (err) {
      console.error(err);
      throw ApiError.unauthorized();
    }
  }

  generateRefreshToken() {
    return randomBytes(32).toString("hex");
  }

  hashRefreshToken(token: string) {
    return createHmac("sha256", process.env.JWT_REFRESH_SECRET!)
      .update(token)
      .digest("hex");
  }
}

const tokenService = new TokenService();
export { tokenService };
