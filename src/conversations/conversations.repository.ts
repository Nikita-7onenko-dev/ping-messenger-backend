import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";
import type { PrivateConversationRow } from "./conversations.types.js";
import type { PoolClient } from "pg";

class ConversationsRepository {
  async createPrivate(
    client: PoolClient,
    userId: string,
    participantId: string,
  ) {
    try {
      const result = await client.query<{ id: string }>(
        `INSERT INTO conversations (
              type,
              private_user_a_id,
              private_user_b_id
          )
          VALUES (
              'private',
              LEAST($1::uuid, $2::uuid),
              GREATEST($1::uuid, $2::uuid)
          )
          ON CONFLICT (private_user_a_id, private_user_b_id)
          DO UPDATE SET id = conversations.id
          RETURNING id AS "id";`,
        [userId, participantId],
      );
      const [row] = result.rows;
      return row;
    } catch (err) {
      throw translateDBError(err, "conversations");
    }
  }

  async addMembers(
    client: PoolClient,
    conversationId: string,
    userId: string,
    participantId: string,
  ) {
    try {
      await client.query(
        `INSERT INTO conversation_members (
          conversation_id,
          user_id
        )
        VALUES 
          ($1::uuid, $2::uuid),
          ($1::uuid, $3::uuid)
          ON CONFLICT (conversation_id, user_id) DO NOTHING`,
        [conversationId, userId, participantId],
      );
    } catch (err) {
      throw translateDBError(err, "conversation_members");
    }
  }

  async getConversations(userId: string) {
    try {
      const result = await pool.query<PrivateConversationRow>(
        `SELECT 
          c.id,

          u.id AS "participantId",
          u.name AS "participantName",

          a.id AS "avatarId",
          a.transformations,

          m.id AS "messageId",
          m.user_id AS "senderId",
          m.content,
          m.created_at AS "createdAt",
          m.delivered_at AS "deliveredAt",
          m.read_at AS "readAt",
          
          uc.count::int AS "unreadCount"

        FROM conversation_members AS cm
        JOIN conversations AS c
          ON c.id = cm.conversation_id
        JOIN conversation_members AS pcm
          ON pcm.conversation_id = c.id 
          AND pcm.user_id <> $1
        JOIN users AS u
          ON u.id = pcm.user_id

        LEFT JOIN LATERAL (
          SELECT
            id,
            transformations
          FROM user_avatars
          WHERE user_id = u.id
          ORDER BY
            (id = u.current_avatar_id) DESC,
            created_at DESC
          LIMIT 1
        ) AS a ON TRUE

        LEFT JOIN LATERAL (
          SELECT
            id,
            user_id,
            content,
            created_at,
            delivered_at,
            read_at
          FROM messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS m ON TRUE
        
        LEFT JOIN LATERAL (
          SELECT COUNT (*) AS count
          FROM messages
          WHERE conversation_id = c.id
          AND user_id <> $1
          AND read_at IS NULL
        ) as uc ON TRUE       
        WHERE cm.user_id = $1`,
        [userId],
      );
      return result.rows;
    } catch (err) {
      throw translateDBError(err, "conversations");
    }
  }
}

const conversationsRepository = new ConversationsRepository();
export { conversationsRepository };
