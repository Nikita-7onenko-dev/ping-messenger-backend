import type { Request } from "express";
import { SUPPORTED_LOCALES } from "../locale/supportedLocales.js";
import type { Locale } from "@/users/settings/settings.types.js";

const isLocale = (locale: string): locale is Locale => {
  if (SUPPORTED_LOCALES.includes(locale as Locale)) return true;
  else return false;
};

export function resolveLocale(req: Request): Locale {
  const locale = req.acceptsLanguages([...SUPPORTED_LOCALES]);

  if (locale && isLocale(locale)) {
    return locale;
  }

  return "en";
}
