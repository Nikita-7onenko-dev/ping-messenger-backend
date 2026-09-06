import { pool } from "@/database/database.config.js";
import type {
  GroupMessagePayload,
  Message,
  PrivateMessagePayload,
} from "./messages.types.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { conversationsRepository } from "../conversations.repository.js";
import { messagesRepository } from "./messages.repository.js";
import { socketService } from "@/web-socket/web-socket.service.js";

class MessagesService {
  async sendPrivateMessage(userId: string, payload: PrivateMessagePayload) {
    const client = await pool.connect();
    let message: Message;
    try {
      await client.query("BEGIN");

      const conversation = await conversationsRepository.createPrivate(
        client,
        userId,
        payload.participantId,
      );

      if (!conversation) {
        throw ApiError.internal("Failed to create conversation");
      }

      await conversationsRepository.addMembers(
        client,
        conversation.id,
        userId,
        payload.participantId,
      );

      message = await messagesRepository.sendMessage(client, {
        content: payload.content,
        conversationId: conversation.id,
        userId,
      });

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
    socketService.sendToUser(
      payload.participantId,
      JSON.stringify({
        type: "message.created",
        payload: message,
      }),
    );
  }

  async sendGroupMessage(userId: string, input: GroupMessagePayload) {}
}

const messageService = new MessagesService();
export { messageService };
