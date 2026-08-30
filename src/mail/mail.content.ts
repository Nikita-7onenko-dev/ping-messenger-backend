type MailLocale = "en" | "uk" | "ru";

export type EmailVerificationContent = {
  subject: string;
  title: string;
  description: string;
  button: string;
};

export const emailVerificationContent: Record<
  MailLocale,
  EmailVerificationContent
> = {
  en: {
    subject: "Verify your email",
    title: "Verify your email address",
    description:
      "Thanks for signing up for Ping. Please verify your email address to activate your account.",
    button: "Verify email",
  },

  uk: {
    subject: "Підтвердіть вашу електронну пошту",
    title: "Підтвердіть вашу електронну пошту",
    description:
      "Дякуємо за реєстрацію в Ping. Підтвердіть свою електронну адресу, щоб активувати обліковий запис.",
    button: "Підтвердити email",
  },

  ru: {
    subject: "Подтвердите вашу электронную почту",
    title: "Подтвердите вашу электронную почту",
    description:
      "Спасибо за регистрацию в Ping. Подтвердите свой адрес электронной почты, чтобы активировать аккаунт.",
    button: "Подтвердить email",
  },
};
