import { authenticationMiddleware } from "@/middleware/authentication.middleware.js";
import { emailVerificationMiddleware } from "@/middleware/email-verification.middleware.js";
import { Router } from "express";
import { messagesController } from "./messages.controller.js";

const messagesRouter = Router();

messagesRouter.use(authenticationMiddleware, emailVerificationMiddleware);

messagesRouter.post("/", messagesController.send);

messagesRouter.patch("/:messageId", messagesController.update);

messagesRouter.delete("/:messageId", messagesController.delete);

export { messagesRouter };
