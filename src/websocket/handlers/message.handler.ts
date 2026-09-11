import type WebSocket from "ws";
import { parseMessageData } from "../websocket.incoming-event.schema.js";
import { wsConnectionService } from "../websocket.connection.service.js";
import { stateBuffer } from "../websocket.state-buffer.js";
import { conversationsRepository } from "@/conversations/conversations.repository.js";
import { presenceSubscriptionRegistry } from "../presence/websocket.presence-subscription.registry.js";
import { ApiError } from "@/exceptions/ApiError.js";

export async function handleMessage(
  data: WebSocket.RawData,
  socket: WebSocket,
) {
  try {
    const { type, payload } = parseMessageData(data);
    const { userId } = wsConnectionService.getConnectionContext(socket);

    switch (type) {
      case "message.read": {
        stateBuffer.accumulate({ ...payload, userId });

        const participants = await conversationsRepository.getMembers(
          userId,
          payload.conversationId,
        );
        const participant = participants[0];

        if (!participant) {
          throw ApiError.internal("failed to find participant");
        }

        wsConnectionService.sendToUser(participant.id, { type, payload });
        break;
      }

      case "typing.start":
      case "typing.end": {
        const participants = await conversationsRepository.getMembers(
          userId,
          payload.conversationId,
        );

        const typingEvent = {
          type,
          payload: {
            ...payload,
            userId,
          },
        };

        participants.forEach((p) => {
          wsConnectionService.sendToUser(p.id, typingEvent);
        });
        break;
      }

      case "presence.watch": {
        presenceSubscriptionRegistry.subscribe(userId, payload.subjectIds);

        const presenceState = wsConnectionService.getPresenceSnapshot(
          payload.subjectIds,
        );
        wsConnectionService.sendToUser(userId, presenceState);
        break;
      }

      case "presence.unwatch": {
        presenceSubscriptionRegistry.unsubscribe(userId, payload.subjectIds);
        break;
      }

      case "presence.snapshot": {
        const presenceState = wsConnectionService.getPresenceSnapshot(
          payload.subjectIds,
        );
        wsConnectionService.sendToUser(userId, presenceState);
        break;
      }
    }
  } catch (err) {
    console.error("WebSocket message error:", err);
  }
}
