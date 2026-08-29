import type { Request, Response } from "express";
import { avatarService } from "./avatar.service.js";

class AvatarController {
  async upload(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const response = await avatarService.upload(userId, req.body);
    res.status(200).json(response);
  }
}

const avatarController = new AvatarController();
export { avatarController };
