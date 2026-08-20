import type { Request, Response } from "express";
import { userService } from "./user.service.js";

class UserController {
  async create(req: Request, res: Response) {
    try {
      console.log(req.body);
      const user = await userService.create(req.body);
      res.status(200).json(user);
    } catch (err) {}
  }
}

const userController = new UserController();
export { userController };
