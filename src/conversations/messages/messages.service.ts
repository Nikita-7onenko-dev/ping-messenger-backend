import { pool } from "@/database/database.config.js";
import type {
  GroupMessagePayload,
  MessageRow,
  PrivateMessagePayload,
  UpdateMessagePayload,
} from "./messages.types.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { conversationsRepository } from "../conversations.repository.js";
import { messagesRepository } from "./messages.repository.js";
import { wsConnectionService } from "@/websocket/websocket.connection.service.js";
import { updateMessageSchema } from "./messages.schema.js";
import { idSchema } from "@/users/user.schema.js";

class MessagesService {
  async sendPrivateMessage(userId: string, payload: PrivateMessagePayload) {
    const client = await pool.connect();
    let message: MessageRow;
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
    wsConnectionService.sendToUser(payload.participantId, {
      type: "message.created",
      payload: message,
    });
  }

  async sendGroupMessage(userId: string, input: GroupMessagePayload) {}

  async update(userId: string, payload: UpdateMessagePayload) {
    const updateMessageInput = updateMessageSchema.parse(payload);

    const result = await messagesRepository.update(userId, updateMessageInput);

    if (!result) throw ApiError.notFound();

    const { message, participantIds } = result;

    participantIds.forEach((participantId) => {
      wsConnectionService.sendToUser(participantId, {
        type: "message.updated",
        payload: message,
      });
    });

    return message;
  }

  async delete(userId: string, messageId: unknown) {
    const validMessageId = idSchema.parse(messageId);

    const result = await messagesRepository.delete(userId, validMessageId);

    if (!result) throw ApiError.notFound();

    const { conversationId, id, participantIds } = result;

    participantIds.forEach((participant) => {
      wsConnectionService.sendToUser(participant, {
        type: "message.deleted",
        payload: {
          id,
          conversationId,
        },
      });
    });
  }
}

const messageService = new MessagesService();
export { messageService };
