import { Router } from "express";
import { userController } from "./user.controller.js";

const userRouter = Router();

userRouter.post("/", userController.register);

// userRouter.get("/me", authMiddleware, getMe) // Auth required
userRouter.get("/:username", userController.getByUsername); // Public
userRouter.delete("/me", userController.deleteMe);

export { userRouter };
