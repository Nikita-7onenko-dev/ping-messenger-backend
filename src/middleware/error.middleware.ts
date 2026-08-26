import type { NextFunction, Request, Response } from "express";
import { ApiError } from "@/exceptions/ApiError.js";
import { z, ZodError } from "zod";

// const errorMap: Record<number, string> = {
//   500: "INTERNAL_SERVER_ERROR",
//   503: "SERVICE_UNAVAILABLE",
// };

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof ApiError && error.status === 500) {
    console.error(error);
    return res.status(error.status).json({ message: "INTERNAL_SERVER_ERROR" });
  }

  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.code });
  }

  if (error instanceof ZodError) {
    return res.status(400).json(z.flattenError(error));
  }

  console.error(error);
  return res.status(500).json({ message: "Unknown error" });
}
