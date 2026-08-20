import { DatabaseError } from "pg";
import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";

import type { CreateUserInput, User } from "./user.schema.js";

class UserRepository {
  async create(validUser: CreateUserInput) {
    try {
      console.log(validUser.password);
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
      if (err instanceof DatabaseError) throw translateDBError(err, "user");
    }
  }
}

const userRepository = new UserRepository();
export { userRepository };
