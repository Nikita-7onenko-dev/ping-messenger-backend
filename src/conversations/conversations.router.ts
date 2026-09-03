import { authenticationMiddleware } from "@/middleware/authentication.middleware.js";
import { emailVerificationMiddleware } from "@/middleware/email-verification.middleware.js";
import { Router } from "express";
import { conversationsController } from "./conversations.controller.js";

const conversationsRouter = Router();

conversationsRouter.use(authenticationMiddleware, emailVerificationMiddleware);

conversationsRouter.get("/", conversationsController.getConversations);

export { conversationsRouter };
