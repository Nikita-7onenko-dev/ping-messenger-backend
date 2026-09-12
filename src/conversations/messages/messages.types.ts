import type z from "zod";
import type { updateMessageSchema } from "./messages.schema.js";

export type PrivateMessagePayload = {
  participantId: string;
  content: string;
};

export type GroupMessagePayload = {
  conversationId: string;
  content: string;
};

export type CreateMessageInput = {
  conversationId: string;
  userId: string;
  content: string;
};

export type CreateMessagePayload = PrivateMessagePayload | GroupMessagePayload;

export type UpdateMessagePayload = {
  messageId: unknown;
  content: unknown;
};

export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;

export type MessageCursor = {
  createdAt: Date;
  id: string;
};

export type ReadAtPayload = {
  id: string;
  conversationId: string;
  readAt: string;
  userId: string;
};

export type MessageRow = {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  createdAt: Date;
  readAt: Date | null;
  updatedAt: Date | null;
};
