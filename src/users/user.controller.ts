import type { Request, Response } from "express";
import { userService } from "./user.service.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { generateRandomToken } from "@/utils/generateRandomToken.js";
import { getClientIp } from "@/utils/getClientIp.js";
import { sessionService } from "./session/session.service.js";

const isProd = process.env.IS_PROD === "true";

class UserController {
  async register(req: Request, res: Response) {
    const ipAddress = isProd
      ? getClientIp(req)
      : (process.env.DEV_TEST_IP ?? getClientIp(req));
    const userAgent = req.get("User-Agent") || null;

    const { tokens, user, session } = await userService.register(
      req.body,
      userAgent,
      ipAddress,
    );

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    const csrfToken = generateRandomToken();
    res.cookie("csrfToken", csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.setHeader("Authorization", `Bearer ${tokens.accessToken}`);
    res.status(201).json({ user, session });
  }

  async getByUsername(req: Request, res: Response) {
    const { username } = req.params;

    if (!username) {
      throw ApiError.badRequest(`Bad request: username is not specified`);
    }

    if (Array.isArray(username)) {
      throw ApiError.badRequest("Bad request: invalid request format");
    }

    const user = await userService.getByUsername(username);
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

  async getMySessions(req: Request, res: Response) {
    const id = req.userId!; // checked in middleware

    const sessions = await sessionService.getAll(id);
    res.status(200).json(sessions);
  }

  async endAllSessionsExceptCurrent(req: Request, res: Response) {
    const { userId, sessionId } = req; // checked in middleware
    await sessionService.endAllExceptCurrent(sessionId!, userId!);
    res.sendStatus(204);
  }

  async endSessionById(req: Request, res: Response) {
    const userId = req.userId!; // checked in middleware
    const { sessionId } = req.params;

    if (!sessionId) {
      throw ApiError.badRequest(`Bad request: sessionId is not specified`);
    }

    if (Array.isArray(sessionId)) {
      throw ApiError.badRequest("Bad request: invalid request format");
    }

    await sessionService.endById(sessionId, userId!);
    res.sendStatus(204);
  }
}

const userController = new UserController();
export { userController };
