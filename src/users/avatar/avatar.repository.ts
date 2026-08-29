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

  async completeUpload(avatarId: string, publicId: string) {
    try {
      const result = await pool.query(
        `UPDATE user_avatars
        SET public_id = $2
        WHERE id = $1`,
        [avatarId, publicId],
      );
      return result.rowCount === 1;
    } catch (err) {
      throw translateDBError(err, "user_avatars");
    }
  }

  async getGallery(userId: string) {
    try {
      const result = await pool.query<AvatarFromGallery>(
        `SELECT
          ua.id AS "avatarId",
          ua.public_id AS "publicId",
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
      const result = await pool.query<{ publicId: string }>(
        `SELECT public_id AS "publicId"
          FROM user_avatars
          WHERE user_id = $1 AND id = $2`,
        [userId, avatarId],
      );
      const [avatar] = result.rows;
      return avatar;
    } catch (err) {
      throw translateDBError(err, "user_avatars");
    }
  }

  async delete(userId: string, avatarId: string) {
    try {
      const result = await pool.query(
        `DELETE FROM user_avatars
          WHERE user_id = $1 AND id = $2`,
        [userId, avatarId],
      );
    } catch (err) {
      throw translateDBError(err, "user_avatars");
    }
  }
}

const avatarRepository = new AvatarRepository();
export { avatarRepository };
