import type WebSocket from "ws";
import { wsConnectionService } from "../websocket.connection.service.js";

export function handlePong(socket: WebSocket) {
  try {
    wsConnectionService.updateAlive(socket);
  } catch (err) {
    console.error("Websocket heartbeat error: ", err);
  }
}
