import { rateLimiter } from "@/rateLimiter/rateLimiter.js";
import type { NextFunction, Request, Response } from "express";

export function rateLimiterMiddleware(limit: number, windowMs?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId!; // checked in auth middleware
    rateLimiter.check(userId, limit, windowMs);

    next();
  };
}
