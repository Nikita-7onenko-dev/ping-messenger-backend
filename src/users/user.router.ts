import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticationMiddleware } from "@/middleware/authentication.middleware.js";
import { emailVerificationMiddleware } from "@/middleware/email-verification.middleware.js";
import { avatarController } from "./avatar/avatar.controller.js";

const userRouter = Router();

// Personal
userRouter.get(
  "/me",
  authenticationMiddleware,
  emailVerificationMiddleware,
  userController.getMe,
);
userRouter.patch(
  "/me",
  authenticationMiddleware,
  emailVerificationMiddleware,
  userController.updateMe,
);
userRouter.delete(
  "/me",
  authenticationMiddleware,
  emailVerificationMiddleware,
  userController.deleteMe,
);

// Sessions
userRouter.get(
  "/me/sessions",
  authenticationMiddleware,
  emailVerificationMiddleware,
  userController.getMySessions,
);
userRouter.delete(
  "/me/sessions",
  authenticationMiddleware,
  emailVerificationMiddleware,
  userController.endAllSessionsExceptCurrent,
);
userRouter.delete(
  "/me/sessions/:sessionId",
  authenticationMiddleware,
  emailVerificationMiddleware,
  userController.endSessionById,
);

// Avatar
userRouter.post(
  "/me/avatars/upload",
  authenticationMiddleware,
  emailVerificationMiddleware,
  avatarController.upload,
);

// Public
userRouter.get("/:username", userController.getByUsername);

export { userRouter };
