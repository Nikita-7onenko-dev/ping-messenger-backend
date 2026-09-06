import { Router } from "express";
import { webhookController } from "./webhook.controller.js";
import { verifyCloudinaryWebhook } from "@/middleware/verify-cloudinary-webhook.middleware.js";

const webhookRouter = Router();

webhookRouter.post(
  "/cloudinary/confirm",
  verifyCloudinaryWebhook,
  webhookController.confirmUpload,
);

export { webhookRouter };
