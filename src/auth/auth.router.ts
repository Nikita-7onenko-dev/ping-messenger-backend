import { Router } from "express";
import { authenticationMiddleware } from "@/middleware/authentication.middleware.js";
import { authController } from "./auth.controller.js";
import { csrfMiddleware } from "@/middleware/csrf.middleware.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", csrfMiddleware, authController.refresh);
authRouter.post(
  "/logout",
  csrfMiddleware,
  authenticationMiddleware,
  authController.logout,
);

export { authRouter };
