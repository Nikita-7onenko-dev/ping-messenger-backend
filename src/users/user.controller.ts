import type { Request, Response } from "express";
import { userService } from "./user.service.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { generateRandomToken } from "@/utils/generateRandomToken.js";
import { getClientIp } from "@/utils/getClientIp.js";

const isProd = process.env.IS_PROD === "true";

class UserController {
  async register(req: Request, res: Response) {
    const ipAddress = /* getClientIp(req) */ "185.212.237.181";
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

  async deleteMe(req: Request, res: Response) {
    const id = req.userId;

    if (!id || typeof id !== "string") {
      throw ApiError.unauthorized("Unauthorized");
    }

    await userService.deleteMe(id);
    res.status(200).json({ message: "Success" });
  }
}

const userController = new UserController();
export { userController };
