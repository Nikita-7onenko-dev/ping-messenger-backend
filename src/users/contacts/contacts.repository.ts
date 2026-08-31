import { pool } from "@/database/database.config.js";
import { translateDBError } from "@/database/errors/translateDBError.js";
import type { Contact } from "./contacts.types.js";

class ContactsRepository {
  async getContacts(userId: string) {
    try {
      const result = await pool.query<Contact>(
        `SELECT 
          uc.contact_id as "userId",
          u.name,
          ua.id AS "avatarId",
          ua.transformations,
          s.last_online_at as "lastOnlineAt"
          FROM user_contacts AS uc
        
          JOIN users AS u
              ON u.id = uc.contact_id

          LEFT JOIN LATERAL (
            SELECT id, transformations
            FROM user_avatars AS ua
            WHERE ua.user_id = u.id
            ORDER BY 
              (ua.id = u.current_avatar_id) DESC,
              ua.created_at DESC
            LIMIT 1
          ) AS ua ON NOT u.is_deleted

          LEFT JOIN LATERAL (
            SELECT last_online_at
            FROM user_sessions AS s
            WHERE s.user_id = u.id
            ORDER BY
              last_online_at DESC
            LIMIT 1
          ) AS s ON true 

          WHERE uc.user_id = $1;`,
        [userId],
      );

      return result.rows;
    } catch (err) {
      translateDBError(err, "user_contacts");
    }
  }

  async addContact(userId: string, contactId: string) {
    try {
      await pool.query(
        `INSERT INTO user_contacts (user_id, contact_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;`,
        [userId, contactId],
      );
    } catch (err) {
      throw translateDBError(err, "user_contacts");
    }
  }

  async deleteContactById(userId: string, contactId: string) {
    try {
      await pool.query(
        `DELETE FROM user_contacts
        WHERE user_id = $1 AND contact_id = $2`,
        [userId, contactId],
      );
    } catch (err) {
      throw translateDBError(err, "user_contacts");
    }
  }
}

const contactsRepository = new ContactsRepository();
export { contactsRepository };
