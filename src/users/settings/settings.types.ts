import type { SUPPORTED_LOCALES } from "@/common/locale/supportedLocales.js";

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type UserSettings = {
  locale: Locale;
};
