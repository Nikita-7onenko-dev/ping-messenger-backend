import { ApiError } from "@/exceptions/ApiError.js";
import type { NextFunction, Response, Request } from "express";

export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const csrfToken = req.cookies.csrfToken;
  const csrfHeader = req.header("csrfToken");
  if (
    typeof csrfToken !== "string" ||
    typeof csrfHeader !== "string" ||
    csrfToken !== csrfHeader
  ) {
    throw ApiError.forbidden();
  }

  next();
}
