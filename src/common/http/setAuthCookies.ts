import type { Response } from "express";
import { generateRandomToken } from "../crypto/generateRandomToken.js";

const isProd = process.env.IS_PROD === "true";

export function setAuthCookies(res: Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, {
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
}
