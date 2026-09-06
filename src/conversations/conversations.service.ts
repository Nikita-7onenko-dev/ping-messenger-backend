import { conversationsRepository } from "./conversations.repository.js";
import { buildAvatarUrl } from "@/users/avatar/build-avatar.js";
import type { Conversation } from "./conversations.types.js";
import { buildLastMessage } from "./conversations.mapper.js";
import { idSchema } from "@/users/user.schema.js";
import { messagesRepository } from "./messages/messages.repository.js";
import type { MessageCursor } from "./messages/messages.types.js";

class ConversationsService {
  async getConversations(userId: string): Promise<Conversation[]> {
    const conversationRows =
      await conversationsRepository.getConversations(userId);
    return conversationRows.map((c) => {
      return {
        id: c.id,
        participant: {
          id: c.participantId,
          name: c.participantName,
          avatar: c.avatarId
            ? {
                id: c.avatarId,
                url: buildAvatarUrl(c.avatarId, c.transformations, "thumbnail"),
              }
            : null,
        },
        lastMessage: buildLastMessage(c),
        unreadCount: c.unreadCount,
      };
    });
  }

  async getHistory(
    userId: string,
    conversationId: unknown,
    cursor?: MessageCursor,
  ) {
    const validConversationId = idSchema.parse(conversationId);
    const history = await messagesRepository.getHistory(
      userId,
      validConversationId,
      cursor,
    );
    let nextCursor = null;
    if (history.length > 20) {
      nextCursor = {
        createdAt: history[history.length - 2]?.createdAt,
        id: history[history.length - 2]?.id,
      };
    }
    return {
      messages: history.slice(0, 20).reverse(),
      nextCursor,
    };
  }
}

const conversationsService = new ConversationsService();
export { conversationsService };
