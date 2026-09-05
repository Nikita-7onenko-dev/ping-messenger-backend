import type { PrivateConversationRow } from "./conversations.types.js";
import type { Message } from "./messages/messages.types.js";

export function buildLastMessage(row: PrivateConversationRow): Message | null {
  if (!row.messageId) {
    return null;
  }

  if (!row.senderId || !row.content || !row.createdAt) {
    throw new Error("Invalid message projection");
  }

  return {
    id: row.messageId,
    conversationId: row.id,
    userId: row.senderId,
    content: row.content,
    createdAt: row.createdAt,
    readAt: row.readAt,
  };
}
