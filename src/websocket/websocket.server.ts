import { server } from "@/server.js";
import { WebSocketServer } from "ws";
import { parse } from "cookie";
import { sessionRepository } from "@/users/session/session.repository.js";
import { tokenService } from "@/token/token.service.js";
import { wsConnectionService } from "./websocket.connection.service.js";
import { handleClose } from "./handlers/close.handler.js";
import { handlePong } from "./handlers/pong.handler.js";
import { handleMessage } from "./handlers/message.handler.js";
import { notifyUserPresenceStatus } from "./presence/notify-user-presence-status.js";

export function setupWebSocketServer() {
  const wss = new WebSocketServer({
    noServer: true,
  });

  wsConnectionService.startHeartbeat();

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
      const { becameOnline } = wsConnectionService.connect(
        session.userId,
        session.id,
        ws,
      );

      if (becameOnline) notifyUserPresenceStatus(session.userId, "user.online");

      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (socket) => {
    socket.on("close", () => handleClose(socket));

    socket.on("pong", () => handlePong(socket));

    socket.on("message", (data) => handleMessage(data, socket));
  });
}
