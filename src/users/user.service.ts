import { validateUser } from "./user.schema.js";
import bcrypt from "bcrypt";
import { userRepository } from "./user.repository.js";

class UserService {
  async create(reqBody: unknown) {
    const validUser = validateUser(reqBody)!;
    const hash = await bcrypt.hash(validUser.password, 12);
    const user = await userRepository.create({
      ...validUser,
      password: hash,
    });
    return user;
  }
}

const userService = new UserService();
export { userService };
