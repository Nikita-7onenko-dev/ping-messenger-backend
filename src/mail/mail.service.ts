import { BrevoClient } from "@getbrevo/brevo";
import { mailErrorHandler } from "./mail.error-handler.js";
import type { Locale } from "@/users/settings/settings.types.js";
import { emailVerificationContent } from "./mail.content.js";
import { buildEmailVerificationHtml } from "./mail.builder.js";

class MailService {
  brevoClient: BrevoClient;
  constructor() {
    this.brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });
  }

  async sendEmailVerification(
    email: string,
    activationLink: string,
    locale: Locale,
  ) {
    const content = emailVerificationContent[locale];
    const htmlContent = buildEmailVerificationHtml(content, activationLink);

    try {
      await this.brevoClient.transactionalEmails.sendTransacEmail({
        sender: {
          name: "Ping",
          email: process.env.MAIL_FROM,
        },
        to: [{ email }],
        subject: content.subject,
        htmlContent,
      });
    } catch (err) {
      throw mailErrorHandler(err);
    }
  }
}

const mailService = new MailService();
export { mailService };
