import { translateDBError } from "@/database/errors/translateDBError.js";
import type {
  CreateSessionInput,
  SessionRow,
  SessionMetadata,
} from "./session.types.js";
import { pool } from "@/database/database.config.js";
import { ApiError } from "@/exceptions/ApiError.js";

class SessionRepository {
  async create(createSessionInput: CreateSessionInput) {
    try {
      const sessionResult = await pool.query<{
        id: string;
      }>(
        `INSERT INTO user_sessions 
          (user_id, refresh_token_hash, expires_at, ip_address, user_agent, country, city)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `,
        [
          createSessionInput.userId,
          createSessionInput.refreshTokenHash,
          createSessionInput.expiresAt,
          createSessionInput.ipAddress,
          createSessionInput.userAgent,
          createSessionInput.country,
          createSessionInput.city,
        ],
      );
      const [session] = sessionResult.rows;

      if (!session) throw ApiError.internal("Failed to create user session");

      return session.id;
    } catch (err) {
      throw translateDBError(err, "user_sessions");
    }
  }

  async getByRefreshTokenHash(refreshTokenHash: string) {
    try {
      const result = await pool.query<{
        id: string;
        userId: string;
        expiresAt: Date;
      }>(
        `SELECT id, user_id AS "userId", expires_at AS "expiresAt"
          FROM user_sessions
          WHERE refresh_token_hash = $1
        `,
        [refreshTokenHash],
      );
      const [session] = result.rows;
      return session;
    } catch (err) {
      throw translateDBError(err, "user_sessions");
    }
  }

  async getAll(userId: string) {
    try {
      const result = await pool.query<SessionRow>(
        `SELECT 
          id, 
          last_online_at AS "lastOnlineAt", 
          ip_address AS "ipAddress", 
          user_agent AS "userAgent", 
          country, 
          city
          FROM user_sessions
          WHERE user_id = $1`,
        [userId],
      );
      return result.rows;
    } catch (err) {
      throw translateDBError(err, "user_sessions");
    }
  }

  async updateMetadata(sessionId: string, meta: SessionMetadata) {
    try {
      const result = await pool.query(
        `UPDATE user_sessions
          SET
            ip_address = $1,
            user_agent = $2,
            country = $3,
            city = $4
          WHERE id = $5`,
        [meta.ipAddress, meta.userAgent, meta.country, meta.city, sessionId],
      );
      return result.rowCount === 1;
    } catch (err) {
      throw translateDBError(err, "user_sessions");
    }
  }

  async updateLastOnline(sessionId: string) {
    try {
      const result = await pool.query(
        `UPDATE user_sessions
          SET last_online_at = NOW()
          WHERE id = $1`,
        [sessionId],
      );
      return result.rowCount === 1;
    } catch (err) {
      throw translateDBError(err, "user_sessions");
    }
  }

  async deleteById(sessionId: string, userId: string) {
    try {
      const result = await pool.query(
        `DELETE FROM user_sessions
          WHERE id = $1
            AND user_id = $2`,
        [sessionId, userId],
      );
      return result.rowCount === 1;
    } catch (err) {
      throw translateDBError(err, "user_sessions");
    }
  }

  async deleteAllExceptCurrent(sessionId: string, userId: string) {
    try {
      await pool.query(
        `DELETE FROM user_sessions
          WHERE user_id = $1
            AND id <> $2`,
        [userId, sessionId],
      );
    } catch (err) {
      throw translateDBError(err, "user_sessions");
    }
  }

  async deleteExpired() {
    try {
      const result = await pool.query(
        `DELETE FROM user_sessions
          WHERE expires_at < NOW()`,
      );
      return result.rowCount;
    } catch (err) {
      throw translateDBError(err, "user_sessions");
    }
  }
}

const sessionRepository = new SessionRepository();
export { sessionRepository };
