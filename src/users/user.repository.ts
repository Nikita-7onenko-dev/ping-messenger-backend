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
      const { rows } = result;
      const [user] = rows;
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
      const { rows } = result;
      const [user] = rows;
      return user;
    } catch (err) {
      throw translateDBError(err, "user");
    }
  }
}

const userRepository = new UserRepository();
export { userRepository };
