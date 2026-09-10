import { ApiError } from "@/exceptions/ApiError.js";
import { WebSocket } from "ws";
import type { OutgoingEventType } from "./websocket.outgoing-event.types.js";

type Connection = {
  socket: WebSocket;
  isAlive: boolean;
  sessionId: string;
};

class WsConnectionService {
  private clients = new Map<string, Set<Connection>>();
  private userIds = new Map<WebSocket, string>();

  startHeartbeat() {
    setInterval(() => {
      this.clients.values().forEach((connections) => {
        connections.values().forEach((connection) => {
          if (!connection.isAlive) {
            connection.socket.terminate();
            return;
          }

          connection.socket.ping();
          connection.isAlive = false;
        });
      });
    }, 30_000);
    console.log("WebSocket heartbeat started");
  }

  updateAlive(socket: WebSocket) {
    const { connection } = this.getConnectionContext(socket);
    connection.isAlive = true;
  }

  getConnectionContext(socket: WebSocket) {
    const userId = this.userIds.get(socket);
    if (!userId) {
      throw ApiError.internal("Socket is not registered");
    }

    const connections = this.clients.get(userId);
    if (!connections) {
      throw ApiError.internal("User sockets are not registered");
    }

    const connection = connections
      .values()
      .find((connection) => connection.socket === socket);
    if (!connection) {
      throw ApiError.internal("User connection are not found");
    }
    return {
      userId,
      connections,
      connection,
    };
  }

  connect(userId: string, sessionId: string, socket: WebSocket) {
    const connection = {
      socket,
      isAlive: true,
      sessionId,
    };
    const sockets = this.clients.get(userId) ?? new Set<Connection>();

    sockets.add(connection);
    this.clients.set(userId, sockets);
    this.userIds.set(socket, userId);

    return {
      becameOnline: sockets.size === 1,
    };
  }

  disconnect(socket: WebSocket) {
    const { connections, connection, userId } =
      this.getConnectionContext(socket);

    connections.delete(connection);

    if (!connections.size) {
      this.clients.delete(userId);
    }

    this.userIds.delete(socket);

    return {
      connections,
      connection,
      userId,
      becameOffline: connections.size === 0,
    };
  }

  sendToUser(userId: string, payload: OutgoingEventType) {
    const data = JSON.stringify(payload);
    const userConnections = this.clients.get(userId);
    if (!userConnections) return;
    userConnections.forEach((connection) => {
      connection.socket.send(data);
    });
  }

  getPresenceSnapshot(subjectIds: string[]) {
    return {
      type: "presence.snapshot",
      payload: {
        subjects: subjectIds.map((subjectId) => ({
          [subjectId]: this.clients.has(subjectId),
        })),
      },
    };
  }
}

const wsConnectionService = new WsConnectionService();
export { wsConnectionService };
