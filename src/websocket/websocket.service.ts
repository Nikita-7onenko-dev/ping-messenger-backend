import { ApiError } from "@/exceptions/ApiError.js";
import { WebSocket } from "ws";

type Connection = {
  socket: WebSocket;
  isAlive: boolean;
  sessionId: string;
};

class WebSocketService {
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

  getConnectionContext(socket: WebSocket) {
    const userId = this.userIds.get(socket);
    if (!userId) {
      throw ApiError.internal("Socket is not registered");
    }

    const sockets = this.clients.get(userId);
    if (!sockets) {
      throw ApiError.internal("User sockets are not registered");
    }

    const connection = sockets
      .values()
      .find((connection) => connection.socket === socket);
    if (!connection) {
      throw ApiError.internal("User connection are not found");
    }
    return {
      userId,
      sockets,
      connection,
    };
  }

  updateAlive(socket: WebSocket) {
    const { connection } = this.getConnectionContext(socket);
    connection.isAlive = true;
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
  }

  disconnect(socket: WebSocket) {
    const { sockets, connection, userId } = this.getConnectionContext(socket);

    sockets.delete(connection);

    if (!sockets.size) {
      this.clients.delete(userId);
    }

    this.userIds.delete(socket);

    return {
      sockets,
      connection,
      userId,
    };
  }

  sendToUser(userId: string, data: string) {
    const userConnections = this.clients.get(userId);
    if (!userConnections) return;
    userConnections.forEach((connection) => {
      connection.socket.send(data);
    });
  }
}

const webSocketService = new WebSocketService();
export { webSocketService };
