import type { Request, Response } from "express";
import { avatarService } from "./avatar.service.js";
import { userService } from "../user.service.js";
import { idSchema, usernameSchema } from "../user.schema.js";

class AvatarController {
  async upload(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const response = await avatarService.upload(userId, req.body);
    res.status(200).json(response);
  }

  async setCurrentAvatar(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    await avatarService.setCurrentAvatar(userId, req.body);
    res.sendStatus(204);
  }

  async getPublicGallery(req: Request, res: Response) {
    const username = usernameSchema.parse(req.params.username);

    const user = await userService.getByUsername(username);
    const gallery = await avatarService.getGallery(user.id);
    res.status(200).json(gallery);
  }

  async getMyGallery(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const gallery = await avatarService.getGallery(userId);
    res.status(200).json(gallery);
  }

  async delete(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const validAvatarId = idSchema.parse(req.params.avatarId);

    await avatarService.delete(userId, validAvatarId);
    res.sendStatus(204);
  }
}

const avatarController = new AvatarController();
export { avatarController };
