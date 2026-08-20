import { ZodError } from "zod";
import { validateUser } from "./user.schema.js";
import bcrypt from "bcrypt";
import { userRepository } from "./user.repository.js";

class UserService {
  async create(reqBody: unknown) {
    try {
      const validUser = validateUser(reqBody)!;
      const hash = await bcrypt.hash(validUser.password, 12);
      const user = await userRepository.create({
        ...validUser,
        password: hash,
      });
      return user;
    } catch (err) {
      if (err instanceof ZodError) throw err;
    }
  }
}

const userService = new UserService();
export { userService };
