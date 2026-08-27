import { translateDBError } from "@/database/errors/translateDBError.js";
import type { Locale, UserSettings } from "./settings.types.js";
import { pool } from "@/database/database.config.js";

class UserSettingsRepository {
  async setLocale(userId: string, locale: Locale) {
    try {
      await pool.query(
        `INSERT INTO user_settings (user_id, locale)
          VALUES ($1, $2)
          ON CONFLICT (user_id)
          DO UPDATE SET locale = EXCLUDED.locale;`,
        [userId, locale],
      );
    } catch (err) {
      throw translateDBError(err, "user_settings");
    }
  }

  async getSettings(userId: string) {
    try {
      const result = await pool.query<UserSettings>(
        `SELECT *
          FROM user_settings
          WHERE user_id = $1`,
        [userId],
      );
      const [settings] = result.rows;
      return settings;
    } catch (err) {
      translateDBError(err, "user_settings");
    }
  }
}

const userSettingsRepository = new UserSettingsRepository();
export { userSettingsRepository };
