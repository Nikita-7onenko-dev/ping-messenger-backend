import { generateRandomToken } from "@/common/crypto/generateRandomToken.js";
import { oneTimeTokenRepository } from "./one-time-token.repository.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { pool } from "@/database/database.config.js";
import { userRepository } from "@/users/user.repository.js";
import { hashWithSha256 } from "@/common/crypto/hashWithSha256.js";
import { isExpired } from "@/common/time/isExpired.js";
import { isStillFresh } from "@/common/time/isStillFresh.js";
import { mailService } from "@/mail/mail.service.js";
import { idSchema } from "@/users/user.schema.js";
import { tokenSchema } from "@/auth/auth.schema.js";
import { rateLimiter } from "@/rate-limiter/rateLimiter.js";

class OneTimeTokenService {
  private generateOneTimeToken() {
    const token = generateRandomToken();
    const tokenHash = hashWithSha256(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    return {
      token,
      tokenHash,
      expiresAt,
    };
  }

  async createEmailVerifyLink(userId: string, email: string) {
    const storedToken = await oneTimeTokenRepository.getTokenById(
      userId,
      "email_verification",
    );

    if (storedToken && isStillFresh(storedToken.expiresAt)) {
      throw ApiError.forbidden("ACTIVATION_LINK_ALREADY_EXISTS");
    }

    const { token, tokenHash, expiresAt } = this.generateOneTimeToken();

    const isSuccess = await oneTimeTokenRepository.setToken({
      userId,
      tokenHash,
      expiresAt,
      tokenType: "email_verification",
    });
    if (!isSuccess) throw ApiError.internal("Failed to upsert token");

    await mailService.sendEmailVerification(
      email,
      `${process.env.ORIGIN}/auth/activate?userId=${userId}&token=${token}`,
    );
  }

  async activateEmail(userId: unknown, receivedToken: unknown) {
    const verifiedUserId = idSchema.parse(userId);
    const verifiedReceivedToken = tokenSchema.parse(receivedToken);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const storedToken = await oneTimeTokenRepository.getTokenForUpdate(
        client,
        verifiedUserId,
        "email_verification",
      );

      if (!storedToken) throw ApiError.forbidden("INVALID_CREDENTIALS");
      if (isExpired(storedToken.expiresAt)) {
        throw ApiError.forbidden("ACTIVATION_LINK_EXPIRED");
      }
      if (storedToken.tokenHash !== hashWithSha256(verifiedReceivedToken)) {
        throw ApiError.forbidden("INVALID_CREDENTIALS");
      }

      const isSuccess = await userRepository.activateUserById(
        client,
        verifiedUserId,
      );
      if (!isSuccess) {
        throw ApiError.internal("Failed to activate user: user not found");
      }
      await oneTimeTokenRepository.deleteByUserId(
        client,
        verifiedUserId,
        "email_verification",
      );
      await client.query("COMMIT");

      rateLimiter.reset(verifiedUserId); // clear rate-limit map
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async resendEmailVerification(userId: string) {
    const user = await userRepository.getById(userId);
    if (!user) throw ApiError.internal("Authenticated user not found");

    const { token, tokenHash, expiresAt } = this.generateOneTimeToken();

    const isSuccess = await oneTimeTokenRepository.setToken({
      userId,
      tokenHash,
      expiresAt,
      tokenType: "email_verification",
    });
    if (!isSuccess) throw ApiError.internal("Failed to upsert token");

    await mailService.sendEmailVerification(
      user.email,
      `${process.env.ORIGIN}/auth/activate?userId=${userId}&token=${token}`,
    );
  }
}

const oneTimeTokenService = new OneTimeTokenService();
export { oneTimeTokenService };
