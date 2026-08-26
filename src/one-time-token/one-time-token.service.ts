import { generateRandomToken } from "@/common/crypto/generateRandomToken.js";
import { oneTimeTokenRepository } from "./one-time-token.repository.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { pool } from "@/database/database.config.js";
import { userRepository } from "@/users/user.repository.js";
import { hashWithSha256 } from "@/common/crypto/hashWithSha256.js";
import { isExpired } from "@/common/time/isExpired.js";
import { isStillFresh } from "@/common/time/isStillFresh.js";

class OneTimeTokenService {
  async createEmailVerifyLink(userId: string, email: string) {
    const storedToken = await oneTimeTokenRepository.getTokenById(
      userId,
      "email_verification",
    );

    if (storedToken && isStillFresh(storedToken.expiresAt)) {
      throw ApiError.forbidden("ACTIVATION_LINK_ALREADY_EXISTS");
    }

    const activationToken = generateRandomToken();
    const tokenHash = hashWithSha256(activationToken);
    const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const isSuccess = await oneTimeTokenRepository.setToken({
      userId,
      tokenHash,
      expiresAt: newExpiresAt,
      tokenType: "email_verification",
    });
    if (!isSuccess) throw ApiError.internal("Failed to upsert token");
  }

  async activateEmail(userId: string, receivedToken: string) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const storedToken = await oneTimeTokenRepository.getTokenForUpdate(
        client,
        userId,
        "email_verification",
      );

      if (!storedToken) throw ApiError.forbidden("INVALID_CREDENTIALS");

      if (isExpired(storedToken.expiresAt)) {
        throw ApiError.forbidden("ACTIVATION_LINK_EXPIRED");
      }

      if (storedToken.tokenHash !== hashWithSha256(receivedToken)) {
        throw ApiError.forbidden("INVALID_CREDENTIALS");
      }

      const isSuccess = await userRepository.activateUserById(client, userId);
      if (!isSuccess) {
        throw ApiError.internal("Failed to activate user: user not found");
      }
      await oneTimeTokenRepository.deleteByUserId(
        client,
        userId,
        "email_verification",
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

const oneTimeTokenService = new OneTimeTokenService();
export { oneTimeTokenService };
