import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";
import { ApiError } from "@/exceptions/ApiError.js";

import type {
  CreateUserInput,
  PublicUser,
  User,
  CreateUserResult,
  UpdateUserInput,
} from "./user.types.js";
import type { PoolClient } from "pg";

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

      const result = await client.query<User>(
        `INSERT INTO users (name, username, email) 
            VALUES ($1, $2, $3)
            RETURNING id, name, username, email`,
        [userInput.name, userInput.username, userInput.email],
      );
      const [user] = result.rows;

      if (!user) {
        throw ApiError.internal();
      }

      resource = "user_credentials";

      await client.query(
        `INSERT INTO user_credentials (user_id, password_hash)
          VALUES ($1, $2)
        `,
        [user.id, userInput.passwordHash],
      );

      resource = "user_sessions";

      const sessionResult = await client.query<{
        lastOnlineAt: Date;
        id: string;
      }>(
        `INSERT INTO user_sessions 
          (user_id, refresh_token_hash, expires_at, ip_address, user_agent, country, city)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING last_online_at AS "lastOnlineAt", id
        `,
        [
          user.id,
          userInput.refreshTokenHash,
          userInput.expiresAt,
          userInput.ipAddress,
          userInput.userAgent,
          userInput.country,
          userInput.city,
        ],
      );

      const [session] = sessionResult.rows;

      if (!session) throw ApiError.internal();

      await client.query("COMMIT");

      return { user, session };
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
        `SELECT id, name, username
          FROM users 
          WHERE username = $1`,
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
        `SELECT id, name, username, email
          FROM users
          WHERE id = $1`,
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

      await client.query("COMMIT");

      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      throw translateDBError(err, resource);
    } finally {
      client.release();
    }
  }
}

const userRepository = new UserRepository();
export { userRepository };
