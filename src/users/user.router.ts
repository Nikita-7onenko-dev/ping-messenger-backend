import { Router } from "express";
import { userController } from "./user.controller.js";

const userRouter = Router();

userRouter.post("/", userController.create);
// userRouter.get("/me", authMiddleware, getMe) // Auth required
userRouter.get("/:username", userController.getByUsername); // Public

export { userRouter };
