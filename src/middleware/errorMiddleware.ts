import type { NextFunction, Request, Response } from "express";
import { ApiError } from "@/exceptions/ApiError.js";
import z, { ZodError } from "zod";

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).json(z.flattenError(error));
  }

  console.error(error);
  return res.status(500).json({ message: "Unknown error" });
}
