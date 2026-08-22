import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticationMiddleware } from "@/middleware/authenticationMiddleware.js";

const userRouter = Router();

userRouter.post("/", userController.register);

// userRouter.get("/me", authMiddleware, getMe) // Auth required
userRouter.get("/:username", userController.getByUsername); // Public
userRouter.delete("/me", authenticationMiddleware, userController.deleteMe);

export { userRouter };
