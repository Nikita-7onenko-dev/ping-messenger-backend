import type { Request, Response } from "express";
import { getClientIp } from "@/common/http/getClientIp.js";
import { authService } from "./auth.service.js";
import { setAuthCookies } from "@/common/http/setAuthCookies.js";
import { setAccessTokenHeader } from "@/common/http/setAccessTokenHeader.js";
import { sessionService } from "@/users/session/session.service.js";
import { resolveLocale } from "@/common/http/resolveLocale.js";
import { oneTimeTokenService } from "@/one-time-token/one-time-token.service.js";
import { validateToken } from "./auth.schema.js";

class AuthController {
  async register(req: Request, res: Response) {
    const ipAddress = getClientIp(req);
    const userAgent = req.get("User-Agent") || null;
    const locale = resolveLocale(req);

    const { refreshToken, accessToken } = await authService.register(
      req.body,
      userAgent,
      ipAddress,
      locale,
    );

    setAuthCookies(res, refreshToken);
    setAccessTokenHeader(res, accessToken);
    res.status(201).end();
  }

  async activate(req: Request, res: Response) {
    const { userId, token } = req.query;
    await oneTimeTokenService.activateEmail(userId, token);
    res.redirect(process.env.ORIGIN! + "/users/me");
  }

  async activationResend(req: Request, res: Response) {
    const userId = req.userId!; // checked in auth middleware
    const locale = resolveLocale(req);
    await oneTimeTokenService.resendEmailVerification(userId, locale);
    res.sendStatus(204);
  }

  async login(req: Request, res: Response) {
    const { password, identifier } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = req.get("User-Agent") || null;
    const { refreshToken, accessToken } = await authService.login({
      identifier,
      password,
      ipAddress,
      userAgent,
    });

    setAuthCookies(res, refreshToken);
    setAccessTokenHeader(res, accessToken);
    res.status(204).end();
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.cookies;

    const validRefreshToken = validateToken(refreshToken);
    const tokens = await sessionService.refreshAccessToken(validRefreshToken);
    setAccessTokenHeader(res, tokens.accessToken);
    res.sendStatus(204);
  }

  async logout(req: Request, res: Response) {
    const sessionId = req.sessionId!; // checked in middleware
    const userId = req.userId!; // checked in middleware
    await sessionService.endById(sessionId, userId);
    res.sendStatus(204);
  }
}

const authController = new AuthController();
export { authController };
