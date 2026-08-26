import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";
import type { OneTimeToken, OneTimeTokenType } from "./one-time-token.types.js";
import type { PoolClient } from "pg";

class OneTimeTokenRepository {
  async getTokenById(userId: string, tokenType: OneTimeTokenType) {
    try {
      const result = await pool.query<{ expiresAt: Date; tokenHash: string }>(
        `SELECT
          expires_at AS "expiresAt",
          token_hash AS "tokenHash"
          FROM user_one_time_tokens
          WHERE user_id = $1
            AND token_type = $2
          `,
        [userId, tokenType],
      );
      const [row] = result.rows;
      return row;
    } catch (err) {
      throw translateDBError(err, "user_one_time_tokens");
    }
  }

  async getTokenForUpdate(
    client: PoolClient,
    userId: string,
    tokenType: OneTimeTokenType,
  ) {
    try {
      const result = await client.query<{ expiresAt: Date; tokenHash: string }>(
        `SELECT
          expires_at AS "expiresAt",
          token_hash AS "tokenHash"
          FROM user_one_time_tokens
          WHERE user_id = $1
            AND token_type = $2
          FOR UPDATE
          `,
        [userId, tokenType],
      );
      const [row] = result.rows;
      return row;
    } catch (err) {
      throw translateDBError(err, "user_one_time_tokens");
    }
  }

  async setToken(tokenData: OneTimeToken) {
    try {
      const result = await pool.query(
        `INSERT INTO user_one_time_tokens (user_id, token_hash, expires_at, token_type)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id, token_type)
          DO UPDATE SET 
            token_hash = EXCLUDED.token_hash, 
            expires_at = EXCLUDED.expires_at;
        `,
        [
          tokenData.userId,
          tokenData.tokenHash,
          tokenData.expiresAt,
          tokenData.tokenType,
        ],
      );
      return result.rowCount === 1;
    } catch (err) {
      throw translateDBError(err, "user_one_time_tokens");
    }
  }

  async deleteByUserId(
    client: PoolClient,
    userId: string,
    tokenType: OneTimeTokenType,
  ) {
    try {
      await client.query(
        `DELETE FROM user_one_time_tokens
          WHERE user_id = $1 AND token_type = $2`,
        [userId, tokenType],
      );
    } catch (err) {
      throw translateDBError(err, "user_one_time_tokens");
    }
  }
}

const oneTimeTokenRepository = new OneTimeTokenRepository();
export { oneTimeTokenRepository };
