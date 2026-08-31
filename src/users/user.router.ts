import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticationMiddleware } from "@/middleware/authentication.middleware.js";
import { emailVerificationMiddleware } from "@/middleware/email-verification.middleware.js";
import { avatarController } from "./avatar/avatar.controller.js";
import { sessionController } from "./session/session.controller.js";

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
  sessionController.getMySessions,
);
userRouter.delete(
  "/me/sessions",
  authenticationMiddleware,
  emailVerificationMiddleware,
  sessionController.endAllSessionsExceptCurrent,
);
userRouter.delete(
  "/me/sessions/:sessionId",
  authenticationMiddleware,
  emailVerificationMiddleware,
  sessionController.endSessionById,
);

// Avatar
userRouter.post(
  "/me/avatars/upload",
  authenticationMiddleware,
  emailVerificationMiddleware,
  avatarController.upload,
);
userRouter.get(
  "/me/avatars",
  authenticationMiddleware,
  emailVerificationMiddleware,
  avatarController.getMyGallery,
);
userRouter.patch(
  "/me/current-avatar",
  authenticationMiddleware,
  emailVerificationMiddleware,
  avatarController.setCurrentAvatar,
);
userRouter.delete(
  "/me/avatars/:avatarId",
  authenticationMiddleware,
  emailVerificationMiddleware,
  avatarController.delete,
);

// Public
userRouter.get(
  "/:username/avatars",
  authenticationMiddleware,
  emailVerificationMiddleware,
  avatarController.getPublicGallery,
);

userRouter.get("/:username", userController.getByUsername);

export { userRouter };
