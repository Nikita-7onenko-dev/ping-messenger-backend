import { ApiError } from "@/exceptions/ApiError.js";
import { WebSocket } from "ws";

class SocketService {
  private clients = new Map<string, Set<WebSocket>>();
  private userIds = new Map<WebSocket, string>();

  connect(userId: string, socket: WebSocket) {
    const sockets = this.clients.get(userId) ?? new Set<WebSocket>();
    sockets.add(socket);
    this.clients.set(userId, sockets);
    this.userIds.set(socket, userId);
  }

  disconnect(socket: WebSocket) {
    const userId = this.userIds.get(socket);
    if (!userId) {
      throw ApiError.internal("Socket is not registered");
    }

    const sockets = this.clients.get(userId);
    if (!sockets) {
      throw ApiError.internal("User sockets are not registered");
    }

    sockets.delete(socket);

    if (!sockets.size) {
      this.clients.delete(userId);
    }

    this.userIds.delete(socket);
  }

  sendToUser(userId: string, data: string) {
    const userSockets = this.clients.get(userId);
    if (!userSockets) return;
    userSockets.forEach((socket) => {
      socket.send(data);
    });
  }
}

const socketService = new SocketService();
export { socketService };
