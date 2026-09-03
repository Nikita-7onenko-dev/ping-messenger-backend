import { conversationsRepository } from "./conversations.repository.js";
import { buildAvatarUrl } from "@/users/avatar/build-avatar.js";
import type { Conversation } from "./conversations.types.js";
import { buildLastMessage } from "./conversations.mapper.js";

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
}

const conversationsService = new ConversationsService();
export { conversationsService };
