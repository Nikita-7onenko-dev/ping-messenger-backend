import { translateDBError } from "@/database/errors/translateDBError.js";
import type { PoolClient } from "pg";
import type {
  CreateMessageInput,
  MessageRow,
  MessageCursor,
  ReadAtPayload,
  UpdateMessageInput,
} from "./messages.types.js";
import { ApiError } from "@/exceptions/ApiError.js";
import { pool } from "@/database/database.config.js";

class MessagesRepository {
  async sendMessage(client: PoolClient, input: CreateMessageInput) {
    try {
      const result = await client.query<MessageRow>(
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
          read_at AS "readAt",
          updated_at AS "updatedAt"
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

      const result = await pool.query<MessageRow>(query, params);
      return result.rows;
    } catch (err) {
      throw translateDBError(err, "messages");
    }
  }

  async markMessagesAsRead(input: ReadAtPayload[]) {
    const params = [];
    for (const { userId, id, conversationId, readAt } of input) {
      params.push(userId, id, conversationId, readAt);
    }

    const values = input.map(
      (_, i) => `($${1 + i * 4}, $${2 + i * 4}, $${3 + i * 4}, $${4 + i * 4})`,
    );

    try {
      await pool.query(
        `UPDATE messages AS m
          SET read_at = COALESCE(m.read_at, v.read_at)
          FROM (VALUES 
              ${values.join(", ")}
          ) AS v(user_id, id, conversation_id, read_at)
            WHERE m.id = v.id
            AND EXISTS (
              SELECT 1 FROM conversation_members AS cm
              WHERE cm.user_id = v.user_id
              AND cm.conversation_id = v.conversation_id
            )`,
        params,
      );
    } catch (err) {
      throw translateDBError(err, "messages");
    }
  }

  async update(userId: string, input: UpdateMessageInput) {
    try {
      const result = await pool.query<
        MessageRow & { participantIds: string[] }
      >(
        `UPDATE messages AS m
          SET 
            content = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE 
            m.id = $2
            AND m.user_id = $1
            AND m.created_at >= CURRENT_TIMESTAMP - INTERVAL '72 hours'
          RETURNING 
            m.id, 
            m.conversation_id "conversationId",
            m.content, 
            m.user_id AS "userId",
            m.updated_at AS "updatedAt",
            m.created_at AS "createdAt",
            m.read_at AS "readAt",
            ARRAY(
              SELECT cm.user_id
              FROM conversation_members AS cm
              WHERE cm.conversation_id = m.conversation_id
                AND cm.user_id <> m.user_id
            ) AS "participantIds" `,

        [userId, input.id, input.content],
      );
      const [row] = result.rows;

      if (!row) return null;

      const { participantIds, ...message } = row;
      return {
        participantIds,
        message,
      };
    } catch (err) {
      throw translateDBError(err, "messages");
    }
  }

  async delete(userId: string, messageId: string) {
    try {
      const result = await pool.query<{
        id: string;
        conversationId: string;
        participantIds: string[];
      }>(
        `DELETE FROM messages AS m
        WHERE 
          m.user_id = $1
          AND m.id = $2
        RETURNING
          m.id,
          m.conversation_id as "conversationId",
          ARRAY (
            SELECT FROM conversation_members AS cm
            WHERE cm.conversation_id = m.conversation_id
              AND cm.user_id <> m.user_id
          ) AS "participantIds"`,
        [userId, messageId],
      );
      const [row] = result.rows;
      return row;
    } catch (err) {
      throw translateDBError(err, "messages");
    }
  }
}

const messagesRepository = new MessagesRepository();
export { messagesRepository };
