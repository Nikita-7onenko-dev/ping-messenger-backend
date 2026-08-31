import type { Request, Response } from "express";
import { userService } from "./user.service.js";
import { requireStringParam } from "@/common/http/requireStringParam.js";

class UserController {
  async getByUsername(req: Request, res: Response) {
    const { username } = req.params;
    const validUsername = requireStringParam(username);

    const user = await userService.getByUsername(validUsername);
    res.status(200).json(user);
  }

  async getMe(req: Request, res: Response) {
    const id = req.userId!; // checked in middleware
    const user = await userService.getMe(id);
    res.status(200).json(user);
  }

  async updateMe(req: Request, res: Response) {
    const id = req.userId!; // checked in middleware
    await userService.updateMe(id, req.body);
    res.sendStatus(204);
  }

  async deleteMe(req: Request, res: Response) {
    const id = req.userId!; // checked in middleware

    await userService.deleteMe(id);
    res.sendStatus(204);
  }
}

const userController = new UserController();
export { userController };
