import { translateDBError } from "@/database/errors/translateDBError.js";
import { pool } from "@/database/database.config.js";
import { ApiError } from "@/exceptions/ApiError.js";
import type { AvatarFromGallery } from "./avatar.types.js";

class AvatarRepository {
  async preload(userId: string, transformations: string) {
    try {
      const result = await pool.query<{ avatarId: string }>(
        `INSERT INTO user_avatars (user_id, transformations)
          VALUES ($1, $2)
          RETURNING id AS "avatarId"`,
        [userId, transformations],
      );
      const [row] = result.rows;
      if (!row) throw ApiError.internal("Failed to preload avatar");
      return row;
    } catch (err) {
      throw translateDBError(err, "user_avatars");
    }
  }

  async completeUpload(avatarId: string) {
    try {
      const result = await pool.query(
        `UPDATE user_avatars
        SET confirmed = true
        WHERE id = $1`,
        [avatarId],
      );
      return result.rowCount === 1;
    } catch (err) {
      throw translateDBError(err, "user_avatars");
    }
  }

  async setCurrentAvatar(userId: string, avatarId: string | null) {
    try {
      const result = await pool.query(
        `UPDATE users AS u
       SET current_avatar_id = $2
       WHERE u.id = $1
         AND (
           $2 IS NULL
           OR EXISTS (
             SELECT 1
             FROM user_avatars AS ua
             WHERE ua.id = $2
               AND ua.user_id = $1
           )
         )`,
        [userId, avatarId],
      );
      return result.rowCount === 1;
    } catch (err) {
      throw translateDBError(err, "users");
    }
  }

  async getGallery(userId: string) {
    try {
      const result = await pool.query<AvatarFromGallery>(
        `SELECT
          ua.id AS "avatarId",
          ua.transformations,
          (ua.id = u.current_avatar_id) AS "isCurrent"
        FROM user_avatars AS ua
        JOIN users AS u
          ON u.id = ua.user_id
        WHERE ua.user_id = $1`,
        [userId],
      );
      return result.rows;
    } catch (err) {
      throw translateDBError(err, "user_avatars");
    }
  }

  async getByIdForUser(userId: string, avatarId: string) {
    try {
      const result = await pool.query<{ avatarId: string }>(
        `SELECT id AS "avatarId"
          FROM user_avatars
          WHERE user_id = $1 AND id = $2`,
        [userId, avatarId],
      );
      return result.rowCount === 1;
    } catch (err) {
      throw translateDBError(err, "user_avatars");
    }
  }

  async delete(userId: string, avatarId: string) {
    try {
      await pool.query(
        `DELETE FROM user_avatars
          WHERE user_id = $1 AND id = $2`,
        [userId, avatarId],
      );
    } catch (err) {
      throw translateDBError(err, "user_avatars");
    }
  }

  async getUnconfirmed() {
    try {
      const result = await pool.query<{ avatarId: string }>(
        `SELECT id AS "avatarId"
        FROM user_avatars
        WHERE confirmed = FALSE
          AND created_at < NOW() - INTERVAL '30 minutes'`,
      );

      return result.rows;
    } catch (err) {
      throw translateDBError(err, "user_avatars");
    }
  }

  async getAvatarsOfDeletedUsers() {
    try {
      const result = await pool.query<{ userId: string; avatarId: string }>(
        `SELECT
          ua.user_id AS "userId",
          ua.id AS "avatarId"
        FROM user_avatars AS ua
        JOIN users AS u
          ON u.id = ua.user_id
        WHERE u.is_deleted = TRUE;`,
      );
      return result.rows;
    } catch (err) {
      throw translateDBError(err, "user");
    }
  }

  async schedulerDelete(avatarId: string) {
    try {
      await pool.query(
        `DELETE FROM user_avatars
          WHERE id = $2`,
        [avatarId],
      );
    } catch (err) {
      throw translateDBError(err, "user_avatars");
    }
  }
}

const avatarRepository = new AvatarRepository();
export { avatarRepository };
