import WebSocket from "ws";
import z from "zod";

const messageReadSchema = z.object({
  type: z.literal("message.read"),
  payload: z.object({
    messageId: z.uuid(),
    conversationId: z.uuid(),
    readAt: z.iso.datetime(),
  }),
});

const typingSchema = z.object({
  type: z.union([z.literal("typing.start"), z.literal("typing.end")]),
  payload: z.object({
    conversationId: z.uuid(),
  }),
});

const messageDataSchema = z.discriminatedUnion("type", [
  messageReadSchema,
  typingSchema,
]);

export function parseMessageData(data: WebSocket.RawData) {
  const parsed = JSON.parse(data.toString());

  return messageDataSchema.parse(parsed);
}
