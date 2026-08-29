import { Router } from "express";
import { webhookController } from "./webhook.controller.js";

const webhookRouter = Router();

webhookRouter.post("/cloudinary", webhookController.handleUpload);

export { webhookRouter };
