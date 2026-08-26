import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";
import { ApiError } from "@/exceptions/ApiError.js";

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
}

const authRepository = new AuthRepository();

export { authRepository };
