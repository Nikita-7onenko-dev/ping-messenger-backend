import { DatabaseError } from "pg";
import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";

import type { CreateUserInput, PublicUser, User } from "./user.types.js";

class UserRepository {
  async create(validUser: CreateUserInput) {
    try {
      const result = await pool.query<User>(
        `INSERT INTO users (name, username, email) 
            VALUES ($1, $2, $3)
            RETURNING id, name, username, email`,
        [validUser.name, validUser.username, validUser.email],
      );
      const [user] = result.rows;
      return user;
    } catch (err) {
      throw translateDBError(err, "user");
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
