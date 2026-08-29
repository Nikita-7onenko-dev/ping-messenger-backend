import { translateDBError } from "@/database/errors/translateDBError.js";
import { pool } from "@/database/database.config.js";
import { ApiError } from "@/exceptions/ApiError.js";

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
}

const avatarRepository = new AvatarRepository();
export { avatarRepository };
