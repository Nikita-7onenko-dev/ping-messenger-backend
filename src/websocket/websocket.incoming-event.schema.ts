import WebSocket from "ws";
import z from "zod";

export const messageReadEventSchema = z.object({
  type: z.literal("message.read"),
  payload: z.object({
    id: z.uuid(),
    conversationId: z.uuid(),
    readAt: z.iso.datetime(),
  }),
});

const typingEventSchema = z.object({
  type: z.union([z.literal("typing.start"), z.literal("typing.end")]),
  payload: z.object({
    conversationId: z.uuid(),
  }),
});

const presenceEventSchema = z.object({
  type: z.union([
    z.literal("presence.watch"),
    z.literal("presence.unwatch"),
    z.literal("presence.snapshot"),
  ]),
  payload: z.object({
    subjectIds: z.array(z.uuid()),
  }),
});

const incomingEventSchema = z.discriminatedUnion("type", [
  messageReadEventSchema,
  typingEventSchema,
  presenceEventSchema,
]);

export function parseMessageData(data: WebSocket.RawData) {
  const parsed = JSON.parse(data.toString());

  return incomingEventSchema.parse(parsed);
}
