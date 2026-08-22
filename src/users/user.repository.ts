import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";

import type { UserInput, PublicUser, User } from "./user.types.js";
import { ApiError } from "@/exceptions/ApiError.js";

class UserRepository {
  async create(userInput: UserInput) {
    const client = await pool.connect();
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
        throw ApiError.internal("Failed to create user");
      }

      await client.query(
        `INSERT INTO user_credentials (user_id, password_hash)
          VALUES ($1, $2)
        `,
        [user.id, userInput.passwordHash],
      );

      await client.query(
        `INSERT INTO user_sessions (user_id, refresh_token_hash, expires_at)
          VALUES ($1, $2, $3)
        `,
        [user.id, userInput.refreshTokenHash, userInput.expiresAt],
      );

      await client.query("COMMIT");

      return user;
    } catch (err) {
      await client.query("ROLLBACK");
      throw translateDBError(err, "user");
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

  async deleteById(userId: string) {
    try {
      const result = await pool.query<{ id: string }>(
        `DELETE FROM users
          WHERE id = $1
          RETURNING id`,
        [userId],
      );
      const [row] = result.rows;
      return row;
    } catch (err) {
      throw translateDBError(err, "user");
    }
  }
}

const userRepository = new UserRepository();
export { userRepository };
