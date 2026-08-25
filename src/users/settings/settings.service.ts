import { userSettingsRepository } from "./settings.repository.js";
import type { Locale } from "./settings.types.js";

class UserSettingsService {
  async setLocale(userId: string, locale: Locale) {
    await userSettingsRepository.setLocale(userId, locale);
  }
}

const userSettingsService = new UserSettingsService();
export { userSettingsService };
