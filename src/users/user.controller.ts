import type { Request, Response } from "express";
import { userService } from "./user.service.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { sessionService } from "./session/session.service.js";
import { avatarService } from "./avatar/avatar.service.js";

class UserController {
  async getByUsername(req: Request, res: Response) {
    const { username } = req.params;

    if (!username) {
      throw ApiError.badRequest("MISSING_PARAMETER");
    }

    if (Array.isArray(username)) {
      throw ApiError.badRequest("INVALID_PARAMETER_FORMAT");
    }

    const user = await userService.getByUsername(username);
    res.status(200).json(user);
  }

  async getPublicGallery(req: Request, res: Response) {
    const { username } = req.params;

    if (!username) {
      throw ApiError.badRequest("MISSING_PARAMETER");
    }

    if (Array.isArray(username)) {
      throw ApiError.badRequest("INVALID_PARAMETER_FORMAT");
    }
    const user = await userService.getByUsername(username);
    const gallery = await avatarService.getGallery(user.id);
    res.status(200).json(gallery);
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

  async setCurrentAvatar(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    await userService.setCurrentAvatar(userId, req.body);
    res.sendStatus(204);
  }

  async getMyGallery(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const gallery = await avatarService.getGallery(userId);
    res.status(200).json(gallery);
  }

  async getMySessions(req: Request, res: Response) {
    const id = req.userId!; // checked in middleware
    const sessionId = req.sessionId!; // check in middleware

    const sessions = await sessionService.getAll(id, sessionId);
    res.status(200).json(sessions);
  }

  async endAllSessionsExceptCurrent(req: Request, res: Response) {
    const { userId, sessionId } = req; // checked in middleware
    await sessionService.endAllExceptCurrent(sessionId!, userId!);
    res.sendStatus(204);
  }

  async endSessionById(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const sessionId = req.sessionId!; // checked in middleware

    await sessionService.endById(sessionId, userId);
    res.sendStatus(204);
  }
}

const userController = new UserController();
export { userController };
