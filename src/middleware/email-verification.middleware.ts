import { ApiError } from "@/exceptions/ApiError.js";
import { userRepository } from "@/users/user.repository.js";
import type { Request, Response, NextFunction } from "express";

export async function emailVerificationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.userId!; // checked in auth middleware
  const isActivated = await userRepository.isEmailVerified(userId);
  if (!isActivated) throw ApiError.forbidden("EMAIL_NOT_VERIFIED");

  next();
}
