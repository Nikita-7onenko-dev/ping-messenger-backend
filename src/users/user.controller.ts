import type { Request, Response } from "express";
import { userService } from "./user.service.js";
import { ApiError } from "@/exceptions/ApiError.js";

class UserController {
  async create(req: Request, res: Response) {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  }

  async getByUsername(req: Request, res: Response) {
    const { username } = req.params;

    if (!username) {
      throw ApiError.badRequest("Bad request: username is not specified");
    }

    if (Array.isArray(username)) {
      throw ApiError.badRequest("Bad request: invalid request format");
    }

    const user = await userService.getByUsername(username);
    res.status(200).json(user);
  }
}

const userController = new UserController();
export { userController };
