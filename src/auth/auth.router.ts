import { Router } from "express";
import { authenticationMiddleware } from "@/middleware/authentication.middleware.js";
import { authController } from "./auth.controller.js";
import { csrfMiddleware } from "@/middleware/csrf.middleware.js";
import { rateLimiterMiddleware } from "@/middleware/rate-limiter.middleware.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/activate", authController.activate);
authRouter.post(
  "activate/resend",
  authenticationMiddleware,
  rateLimiterMiddleware(3),
  authController.activationResend,
);
authRouter.post("/refresh", csrfMiddleware, authController.refresh);
authRouter.post(
  "/logout",
  csrfMiddleware,
  authenticationMiddleware,
  authController.logout,
);

export { authRouter };
