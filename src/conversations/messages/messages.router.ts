import { authenticationMiddleware } from "@/middleware/authentication.middleware.js";
import { emailVerificationMiddleware } from "@/middleware/email-verification.middleware.js";
import { Router } from "express";
import { messagesController } from "./messages.controller.js";

const messagesRouter = Router();

messagesRouter.use(authenticationMiddleware, emailVerificationMiddleware);

messagesRouter.post("/", messagesController.sendMessage);

export { messagesRouter };
