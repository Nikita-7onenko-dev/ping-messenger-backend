import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";
import { ApiError } from "@/exceptions/ApiError.js";

import type {
  CreateUserInput,
  PublicUser,
  CreateUserResult,
  UpdateUserInput,
  User,
} from "./user.types.js";

const updateUserAllowedFields = new Set<keyof UpdateUserInput>([
  "name",
  "username",
  "email",
]);

class UserRepository {
  async create(userInput: CreateUserInput): Promise<CreateUserResult> {
    const client = await pool.connect();
    let resource = "user";
    try {
      await client.query("BEGIN");

      const result = await client.query<{ userId: string; email: string }>(
        `INSERT INTO users (name, username, email) 
            VALUES ($1, $2, $3)
            RETURNING id AS "userId", email`,
        [userInput.name, userInput.username, userInput.email],
      );
      const [user] = result.rows;

      if (!user) {
        throw ApiError.internal("Failed to create user");
      }

      resource = "user_credentials";

      await client.query(
        `INSERT INTO user_credentials (user_id, password_hash)
          VALUES ($1, $2)
        `,
        [user.userId, userInput.passwordHash],
      );

      resource = "user_sessions";

      const sessionResult = await client.query<{ sessionId: string }>(
        `INSERT INTO user_sessions 
          (user_id, refresh_token_hash, expires_at, ip_address, user_agent, country, city)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id AS "sessionId"
        `,
        [
          user.userId,
          userInput.refreshTokenHash,
          userInput.expiresAt,
          userInput.ipAddress,
          userInput.userAgent,
          userInput.country,
          userInput.city,
        ],
      );

      const [session] = sessionResult.rows;

      if (!session) {
        throw ApiError.internal(
          `Failed to create session for user ${user.userId}`,
        );
      }

      resource = "user_settings";

      const settingsResult = await client.query(
        `INSERT INTO user_settings (user_id, locale)
          VALUES ($1, $2)`,
        [user.userId, userInput.locale],
      );

      if (settingsResult.rowCount !== 1) {
        throw ApiError.internal(
          `Failed to create settings for user ${user.userId}`,
        );
      }

      await client.query("COMMIT");

      return { ...user, ...session };
    } catch (err) {
      await client.query("ROLLBACK");
      throw translateDBError(err, resource);
    } finally {
      client.release();
    }
  }

  async getByUsername(username: string) {
    try {
      const result = await pool.query<PublicUser>(
        `SELECT u.id, u.name, u.username, ua.id AS "avatarId", ua.transformations
          FROM users AS u
          LEFT JOIN LATERAL (
            SELECT
              id,
              transformations
            FROM user_avatars
            WHERE user_id = u.id
            ORDER BY
              (id = u.current_avatar_id) DESC,
              created_at DESC
            LIMIT 1
          ) AS ua ON true
          WHERE u.username = $1;`,
        [username],
      );
      const [user] = result.rows;
      return user;
    } catch (err) {
      throw translateDBError(err, "user");
    }
  }

  async getById(id: string) {
    try {
      const result = await pool.query<User>(
        `SELECT
          u.id,
          u.name,
          u.username,
          u.email,
          ua.id AS "avatarId",
          ua.transformations
        FROM users AS u
        LEFT JOIN LATERAL (
          SELECT
            id,
            transformations
          FROM user_avatars
          WHERE user_id = u.id
          ORDER BY
            (id = u.current_avatar_id) DESC,
            created_at DESC
          LIMIT 1
        ) AS ua ON true
        WHERE u.id = $1;`,
        [id],
      );
      const [user] = result.rows;
      return user;
    } catch (err) {
      throw translateDBError(err, "user");
    }
  }

  async updateById(id: string, updateData: UpdateUserInput) {
    const queryValues: NonNullable<UpdateUserInput[keyof UpdateUserInput]>[] =
      [];
    const queryKeys: string[] = [];

    Object.keys(updateData).forEach((key) => {
      const value = updateData[key as keyof UpdateUserInput];
      if (
        value !== undefined &&
        updateUserAllowedFields.has(key as keyof UpdateUserInput)
      ) {
        queryValues.push(value);
        queryKeys.push(`${key} = $${queryValues.length}`);
      }
    });
    queryValues.push(id);

    try {
      const result = await pool.query(
        `UPDATE users
          SET
            ${queryKeys.join(", ")}
          WHERE id = $${queryValues.length}`,
        queryValues,
      );
      return result.rowCount === 1;
    } catch (err) {
      throw translateDBError(err, "user");
    }
  }

  async deleteById(userId: string) {
    const client = await pool.connect();
    let resource = "user";
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE users
          SET
            name = NULL,
            username = NULL,
            email = NULL,
            is_deleted = TRUE
          WHERE id = $1 AND is_deleted = FALSE`,
        [userId],
      );

      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return false;
      }

      resource = "user_credentials";
      await client.query(
        `DELETE FROM user_credentials
          WHERE user_id = $1`,
        [userId],
      );

      resource = "user_sessions";
      await client.query(
        `DELETE FROM user_sessions
          WHERE user_id = $1`,
        [userId],
      );

      resource = "user_one_time_tokens";
      await client.query(
        `DELETE FROM user_one_time_tokens
          WHERE user_id = $1`,
        [userId],
      );

      resource = "user_settings";
      await client.query(
        `DELETE FROM user_settings
          WHERE user_id = $1`,
        [userId],
      );

      await client.query("COMMIT");

      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      throw translateDBError(err, resource);
    } finally {
      client.release();
    }
  }

  async hardDelete() {
    try {
      const result = await pool.query(
        `DELETE FROM users u
          WHERE u.is_deleted = TRUE
            AND NOT EXISTS (
                SELECT 1
                FROM conversation_members cm
                WHERE cm.user_id = u.id
            )
            AND NOT EXISTS (
                SELECT 1
                FROM messages m
                WHERE m.user_id = u.id
            );`,
      );
      return result.rowCount;
    } catch (err) {
      throw translateDBError(err, "users");
    }
  }
}

const userRepository = new UserRepository();
export { userRepository };
