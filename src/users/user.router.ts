import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticationMiddleware } from "@/middleware/authentication.middleware.js";

const userRouter = Router();

// Personal
userRouter.get("/me", authenticationMiddleware, userController.getMe);
userRouter.patch("/me", authenticationMiddleware, userController.updateMe);
userRouter.delete("/me", authenticationMiddleware, userController.deleteMe);

// Sessions
userRouter.get(
  "/me/sessions",
  authenticationMiddleware,
  userController.getMySessions,
);
userRouter.delete(
  "/me/sessions",
  authenticationMiddleware,
  userController.endAllSessionsExceptCurrent,
);
userRouter.delete(
  "/me/sessions/:sessionId",
  authenticationMiddleware,
  userController.endSessionById,
);

// Public
userRouter.get("/:username", userController.getByUsername);

export { userRouter };
