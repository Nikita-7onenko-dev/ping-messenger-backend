import type { Request, Response } from "express";
import { getClientIp } from "@/common/utils/getClientIp.js";
import { authService } from "./auth.service.js";
import { setAuthCookies } from "@/common/http/setAuthCookies.js";
import { setAccessTokenHeader } from "@/common/http/setAccessTokenHeader.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { sessionService } from "@/users/session/session.service.js";

class AuthController {
  async register(req: Request, res: Response) {
    const ipAddress = getClientIp(req);
    const userAgent = req.get("User-Agent") || null;

    const { tokens, user, session } = await authService.register(
      req.body,
      userAgent,
      ipAddress,
    );

    setAuthCookies(res, tokens.refreshToken);
    setAccessTokenHeader(res, tokens.accessToken);
    res.status(201).json({ user, session });
  }

  async login(req: Request, res: Response) {
    const { password, identifier } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = req.get("User-Agent") || null;

    const { user, tokens, session } = await authService.login({
      identifier,
      password,
      ipAddress,
      userAgent,
    });

    setAuthCookies(res, tokens.refreshToken);
    setAccessTokenHeader(res, tokens.accessToken);
    res.status(200).json({ user, session });
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.cookies;

    if (!refreshToken || typeof refreshToken !== "string") {
      throw ApiError.unauthorized();
    }
    const tokens = await sessionService.refreshAccessToken(refreshToken);
    setAccessTokenHeader(res, tokens.accessToken);
    res.sendStatus(204);
  }

  async logout(req: Request, res: Response) {
    const sessionId = req.sessionId!; // checked in middleware
    const userId = req.userId!; // checked in middleware
    await sessionService.endById(sessionId, userId);
  }
}

const authController = new AuthController();
export { authController };
