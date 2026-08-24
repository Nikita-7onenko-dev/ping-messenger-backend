import type { Response } from "express";

export function setAccessTokenHeader(res: Response, accessToken: string) {
  res.setHeader("Authorization", `Bearer ${accessToken}`);
}
