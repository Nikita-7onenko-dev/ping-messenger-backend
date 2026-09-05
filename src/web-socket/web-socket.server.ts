import { server } from "@/server.js";
import { WebSocketServer } from "ws";
import { parse } from "cookie";
import { sessionRepository } from "@/users/session/session.repository.js";
import { tokenService } from "@/token/token.service.js";
import { socketService } from "./web-socket.service.js";

export function setupWebSocketServer() {
  const wss = new WebSocketServer({
    noServer: true,
  });

  server.on("upgrade", async (req, socket, head) => {
    const cookies = parse(req.headers.cookie || "");
    const { refreshToken } = cookies;

    if (!refreshToken) {
      socket.destroy();
      return;
    }

    const refreshTokenHash = tokenService.hashRefreshToken(refreshToken);
    const session =
      await sessionRepository.getActiveByRefreshTokenHash(refreshTokenHash);

    if (!session) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      socketService.connect(session.userId, ws);
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (socket) => {
    socket.on("message", (data) => {});
  });
}
