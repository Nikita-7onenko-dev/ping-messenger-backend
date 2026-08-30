import type { EmailVerificationContent } from "./mail.content.js";

export function buildEmailVerificationHtml(
  content: EmailVerificationContent,
  activationLink: string,
) {
  const { title, button, description } = content;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #222;">
      <h1 style="margin-bottom: 16px;">${title}</h1>

      <p style="line-height: 1.6; margin-bottom: 24px;">
        ${description}
      </p>

      <a
        href="${activationLink}"
        style="display: inline-block; padding: 12px 20px; background: #222; color: #fff; text-decoration: none; border-radius: 6px;"
      >
        ${button}
      </a>
    </div>
  `;
}
