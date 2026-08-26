import { BrevoClient } from "@getbrevo/brevo";

class MailService {
  brevoClient: BrevoClient;
  constructor() {
    this.brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });
  }

  async sendEmailVerification(email: string, activationLink: string) {
    const htmlContent = `
        <h1>Verify your email</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${activationLink}">Verify email</a>
      `;

    await this.brevoClient.transactionalEmails.sendTransacEmail({
      sender: {
        name: "Ping",
        email: process.env.MAIL_FROM,
      },
      to: [{ email }],
      subject: "Verify your email",
      htmlContent,
    });
  }
}

const mailService = new MailService();
export { mailService };
