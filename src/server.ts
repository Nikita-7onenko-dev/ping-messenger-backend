import http from "node:http";
import { pool } from "./database/database.config.js";
import { app } from "./app.js";
import { setupWebSocketServer } from "./web-socket/web-socket.server.js";

const PORT = process.env.PORT || 5000;

export const server = http.createServer(app);

async function startApp() {
  console.log("Starting server...");

  try {
    await pool.query("SELECT 1");
    console.log("Database connected successfully");

    server.on("error", (err) => {
      console.log("Failed to start app:", err);
    });

    setupWebSocketServer();

    server.listen(PORT, () => {
      console.log(`RUN SERVER ON PORT ${PORT}`);
      console.log("Come GET /some!");
    });
  } catch (error) {
    console.log("Failed to start app:", error);
    process.exit(1);
  }
}

startApp();
