import z from "zod";
import type { messageReadEventSchema } from "./websocket.incoming-event.schema.js";
import type { MessageRow } from "@/conversations/messages/messages.types.js";

export type PresenceStatusEventType = "user.online" | "user.offline";

type messageReadEvent = z.infer<typeof messageReadEventSchema>;

type TypingEvent = {
  type: "typing.start" | "typing.end";
  payload: {
    userId: string;
    conversationId: string;
  };
};

type PresenceStatusEvent = {
  type: PresenceStatusEventType;
  payload: {
    userId: string;
  };
};

type PresenceSnapshotEvent = {
  type: "presence.snapshot";
  payload: {
    subjects: {
      [x: string]: boolean;
    }[];
  };
};

type MessageCreated = {
  type: "message.created";
  payload: MessageRow;
};

type MessageUpdated = {
  type: "message.updated";
  payload: MessageRow;
};

type MessageDeleted = {
  type: "message.deleted";
  payload: {
    id: string;
    conversationId: string;
  };
};

export type OutgoingEvent =
  | messageReadEvent
  | TypingEvent
  | PresenceStatusEvent
  | PresenceSnapshotEvent
  | MessageCreated
  | MessageUpdated
  | MessageDeleted;
