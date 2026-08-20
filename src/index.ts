import express from "express";
import { pool } from "./database/database.config.js";
import { userRouter } from "./users/user.router.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());

app.use("/users", userRouter);
app.get("/ping", (_, res) => res.json({ message: "pong" }));

app.use(errorMiddleware);

async function startApp() {
  console.log("Starting server...");
  console.log(`PORT: ${PORT}`);

  try {
    await pool.query("SELECT 1");
    console.log("Database connected successfully");

    const server = app.listen(PORT, () => {
      console.log(`RUN SERVER ON PORT ${PORT}`);
      console.log("Come GET /some!");
    });

    server.on("error", (err) => {
      console.log("Failed to start app:", err);
    });
  } catch (error) {
    console.log("Failed to start app:", error);
    process.exit(1);
  }
}

startApp();
