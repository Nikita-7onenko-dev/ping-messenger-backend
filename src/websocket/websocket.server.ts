import { server } from "@/server.js";
import { WebSocketServer } from "ws";
import { parse } from "cookie";
import { sessionRepository } from "@/users/session/session.repository.js";
import { tokenService } from "@/token/token.service.js";
import { webSocketService } from "./websocket.service.js";
import { wsStateBuffer } from "./websocket.state-buffer.js";
import { parseMessageData } from "./websocket.message.schema.js";
import { conversationsRepository } from "@/conversations/conversations.repository.js";
import { sessionService } from "@/users/session/session.service.js";

export function setupWebSocketServer() {
  const wss = new WebSocketServer({
    noServer: true,
  });

  webSocketService.startHeartbeat();

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
      webSocketService.connect(session.userId, session.id, ws);
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (socket) => {
    socket.on("close", async () => {
      try {
        const { connection, userId } = webSocketService.disconnect(socket);

        await sessionService.updateLastOnline(connection.sessionId);
        await wsStateBuffer.flush(userId);
      } catch (err) {
        console.error("Websocket disconnect error: ", err);
      }
    });

    socket.on("pong", () => {
      try {
        webSocketService.updateAlive(socket);
      } catch (err) {
        console.error("Websocket heartbeat error: ", err);
      }
    });

    socket.on("message", async (data) => {
      try {
        const { type, payload } = parseMessageData(data);
        const { userId } = webSocketService.getConnectionContext(socket);
        if (type === "message.read") {
          wsStateBuffer.accumulate(userId, payload);
        }
        if (type === "typing.start" || type === "typing.end") {
          const participants = await conversationsRepository.getMembers(
            userId,
            payload.conversationId,
          );

          const typingEvent = JSON.stringify({
            type,
            payload: {
              ...payload,
              userId,
            },
          });

          participants.forEach((p) => {
            webSocketService.sendToUser(p.id, typingEvent);
          });
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });
  });
}
