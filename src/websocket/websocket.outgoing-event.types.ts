import z from "zod";
import type { messageReadEventSchema } from "./websocket.incoming-event.schema.js";

export type PresenceStatusEventType = "user.online" | "user.offline";

type messageReadEventType = z.infer<typeof messageReadEventSchema>;

type TypingEventType = {
  type: "typing.start" | "typing.end";
  payload: {
    userId: string;
    conversationId: string;
  };
};

type PresenceStateEventType = {
  type: string;
  payload:
    | {
        subjects: {
          [x: string]: boolean;
        }[];
      }
    | {
        userId: string;
      };
};

export type OutgoingEventType =
  | messageReadEventType
  | TypingEventType
  | PresenceStateEventType;
