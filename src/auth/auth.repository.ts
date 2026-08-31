import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";
import { ApiError } from "@/exceptions/ApiError.js";
import type { PoolClient } from "pg";

class AuthRepository {
  async findByIdentifier(identifier: string) {
    let resource = "user";
    try {
      const result = await pool.query<{ userId: string }>(
        `SELECT id AS "userId"
          FROM users 
          WHERE username = $1 OR email = $1 `,
        [identifier],
      );
      const [user] = result.rows;

      if (!user) throw ApiError.unauthorized("INVALID_CREDENTIALS");

      resource = "user_credentials";

      const credentialsResult = await pool.query<{ passwordHash: string }>(
        `SELECT password_hash AS "passwordHash"
          FROM user_credentials
          WHERE user_id = $1`,
        [user.userId],
      );
      const [credential] = credentialsResult.rows;

      if (!credential)
        throw ApiError.internal(
          "Internal database error: user_credentials not found",
        );

      return { ...user, ...credential };
    } catch (err) {
      throw translateDBError(err, resource);
    }
  }

  async activateUserById(client: PoolClient, id: string) {
    try {
      const result = await client.query(
        `UPDATE users
          SET is_activated = true
          WHERE id = $1`,
        [id],
      );
      return result.rowCount === 1;
    } catch (err) {
      throw translateDBError(err, "user");
    }
  }

  async isEmailVerified(userId: string) {
    try {
      const result = await pool.query<{ isActivated: boolean }>(
        `SELECT is_activated AS "isActivated"
          FROM users 
          WHERE id = $1`,
        [userId],
      );
      const [status] = result.rows;
      return status?.isActivated;
    } catch (err) {
      throw translateDBError(err, "user");
    }
  }
}

const authRepository = new AuthRepository();

export { authRepository };
