import { translateDBError } from "@/database/errors/translateDBError.js";
import type { PoolClient } from "pg";
import type { CreateMessageInput } from "./messages.types.js";

class MessagesRepository {
  async sendMessage(client: PoolClient, input: CreateMessageInput) {
    try {
      await client.query(
        `INSERT INTO messages (
          conversation_id,
          user_id,
          content
          )
        VALUES ($1, $2, $3)
          `,
        [input.conversationId, input.userId, input.content],
      );
    } catch (err) {
      throw translateDBError(err, "messages");
    }
  }

  // async updateDelivered(userId: string, conversationId: string, time: Date) {
  //   try {
  //     await pool.query(
  //       `UPDATE messages AS m
  //         SET delivered_at = NOW()
  //         WHERE user_id = $1
  //           conversation_id = $2
  //         AND m.created_at < $3 AND m.delivered_at IS NULL`,
  //       [userId, conversationId, time]
  //     )
  //   } catch (err) {
  //     throw translateDBError(err, "messages");
  //   }
  // }
}

const messagesRepository = new MessagesRepository();
export { messagesRepository };
