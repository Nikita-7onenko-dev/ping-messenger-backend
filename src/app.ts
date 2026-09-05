import express from "express";
import "@/background/scheduler.js";
import { userRouter } from "./users/user.router.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./auth/auth.router.js";
import { webhookRouter } from "./webhook/webhook.router.js";
import { conversationsRouter } from "./conversations/conversations.router.js";
import { messagesRouter } from "./conversations/messages/messages.router.js";

export const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    exposedHeaders: ["Authorization"],
  }),
);
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/webhooks", webhookRouter);
app.use("/conversations", conversationsRouter);
app.use("/messages", messagesRouter);
app.get("/ping", (_, res) => res.json({ message: "pong" }));

app.use(errorMiddleware);
