import { ApiError } from "@/exceptions/ApiError.js";
import { tokenService } from "@/token/token.service.js";
import type { NextFunction, Response, Request } from "express";

export function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw ApiError.unauthorized();

  const [scheme, token] = authHeader.split(" ");
  if (!token || scheme !== "Bearer") throw ApiError.unauthorized();

  const userId = tokenService.verifyAccessToken(token);
  req.userId = userId;
  next();
}
