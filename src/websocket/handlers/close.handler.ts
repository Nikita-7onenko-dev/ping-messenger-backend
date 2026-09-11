import type WebSocket from "ws";
import { sessionService } from "@/users/session/session.service.js";
import { wsConnectionService } from "../websocket.connection.service.js";
import { notifyUserPresenceStatus } from "../presence/notify-user-presence-status.js";
import { presenceSubscriptionRegistry } from "../presence/websocket.presence-subscription.registry.js";

export async function handleClose(socket: WebSocket) {
  try {
    const { connection, userId, becameOffline } =
      wsConnectionService.disconnect(socket);

    if (becameOffline) {
      notifyUserPresenceStatus(userId, "user.offline");
      presenceSubscriptionRegistry.removeSubscriber(userId);
    }

    await sessionService.updateLastOnline(connection.sessionId);
  } catch (err) {
    console.error("Websocket disconnect error: ", err);
  }
}
