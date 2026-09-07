import { translateDBError } from "@/database/errors/translateDBError.js";
import type { PoolClient } from "pg";
import type {
  CreateMessageInput,
  Message,
  MessageCursor,
  ReadAtPayload,
} from "./messages.types.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { pool } from "@/database/database.config.js";

class MessagesRepository {
  async sendMessage(client: PoolClient, input: CreateMessageInput) {
    try {
      const result = await client.query<Message>(
        `INSERT INTO messages (
          conversation_id,
          user_id,
          content
          )
        VALUES ($1, $2, $3)
        RETURNING 
          id,
          conversation_id AS "conversationId", 
          user_id AS "userId", 
          content, 
          created_at AS "createdAt", 
          read_at AS "readAt"`,
        [input.conversationId, input.userId, input.content],
      );
      const [message] = result.rows;

      if (!message) throw ApiError.internal("Failed to create message");

      return message;
    } catch (err) {
      throw translateDBError(err, "messages");
    }
  }

  async getHistory(
    userId: string,
    conversationId: string,
    cursor?: MessageCursor,
  ) {
    try {
      let query = `
        SELECT
          id,
          conversation_id AS "conversationId", 
          user_id AS "userId", 
          content, 
          created_at AS "createdAt", 
          read_at AS "readAt"
        FROM messages
        WHERE conversation_id = $2
          AND EXISTS (
            SELECT 1
              FROM conversation_members AS cm
              WHERE cm.user_id = $1
              AND cm.conversation_id = $2
          )`;

      const params: (string | Date)[] = [userId, conversationId];

      if (cursor) {
        query += `
          AND (
            created_at < $3
              OR (
                created_at = $3
                AND id < $4
              )
            )`;

        params.push(cursor.createdAt, cursor.id);
      }

      query += `
        ORDER BY created_at DESC, id DESC
        LIMIT 21`;

      const result = await pool.query<Message>(query, params);
      return result.rows;
    } catch (err) {
      throw translateDBError(err, "messages");
    }
  }

  async markMessagesAsRead(userId: string, payload: ReadAtPayload[]) {
    const params = [];
    for (const { messageId, conversationId, readAt } of payload) {
      params.push(messageId, conversationId, readAt);
    }

    const values = payload.map(
      (_, i) => `($${2 + i * 3}, $${3 + i * 3}, $${4 + i * 3})`,
    );

    try {
      await pool.query(
        `UPDATE messages AS m
          SET read_at = COALESCE(m.read_at, v.read_at)
          FROM (VALUES 
              ${values.join(", ")}
          ) AS v(id, conversation_id, read_at)
            WHERE m.id = v.id
            AND EXISTS (
              SELECT 1 FROM conversation_members AS cm
              WHERE cm.user_id = $1
              AND cm.conversation_id = v.conversation_id
            )`,
        [userId, ...params],
      );
    } catch (err) {
      throw translateDBError(err, "messages");
    }
  }
}

const messagesRepository = new MessagesRepository();
export { messagesRepository };
