import cloudinary from "@/config/cloudinary.js";
import { ApiError } from "@/exceptions/ApiError.js";
import type { NextFunction, Request, Response } from "express";

export function verifyCloudinaryWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const signature = req.headers["x-cld-signature"];
  const timestamp = req.headers["x-cld-timestamp"];
  const body = req.body;

  if (typeof signature !== "string" || typeof timestamp !== "string") {
    console.error("Invalid webhook signature!");
    throw ApiError.forbidden();
  }
  const timestampNumber = Number(timestamp);

  if (!Number.isInteger(timestampNumber)) {
    console.error("Invalid webhook signature!");
    throw ApiError.forbidden();
  }

  const result = cloudinary.utils.verifyNotificationSignature(
    body,
    timestampNumber,
    signature,
    7200,
  );
  if (!result) {
    console.error("Invalid webhook signature!");
    throw ApiError.forbidden();
  }
  next();
}
