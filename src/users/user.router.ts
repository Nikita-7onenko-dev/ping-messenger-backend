import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticationMiddleware } from "@/middleware/authenticationMiddleware.js";

const userRouter = Router();

userRouter.post("/", userController.register);

userRouter.get("/:username", userController.getByUsername); // Public
userRouter.get("/me", authenticationMiddleware, userController.getMe); // Personal
userRouter.patch("/me", authenticationMiddleware, userController.updateMe);
userRouter.delete("/me", authenticationMiddleware, userController.deleteMe);

export { userRouter };
