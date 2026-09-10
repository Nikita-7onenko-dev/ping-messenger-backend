import { wsConnectionService } from "../websocket.connection.service.js";
import type { PresenceStatusEventType } from "../websocket.outgoing-event.types.js";
import { presenceSubscriptionRegistry } from "./websocket.presence-subscription.registry.js";

export function notifyUserPresenceStatus(
  userId: string,
  type: PresenceStatusEventType,
) {
  const subscribers = presenceSubscriptionRegistry.getSubscribers(userId);

  const presenceEvent = {
    type,
    payload: {
      userId: userId,
    },
  };

  subscribers.forEach((subscriber) => {
    wsConnectionService.sendToUser(subscriber, presenceEvent);
  });
}
