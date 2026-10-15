import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: { user, pass },
      });
      this.isConfigured = true;
      console.log("📧 Email service initialized with SMTP transport.");
    } else {
      console.log("ℹ️  SMTP credentials not provided in .env. Email service operating in Development / Console mode.");
    }
  }

  async sendEmail(payload: EmailPayload): Promise<boolean> {
    const from = process.env.EMAIL_FROM || "notifications@internshiptracker.com";

    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        });
        console.log(`📧 [Sent Email] To: ${payload.to} | Subject: ${payload.subject}`);
        return true;
      } catch (error) {
        console.error("Failed to send real email:", error);
        return false;
      }
    } else {
      // Development mode logging
      console.log(`----------------------------------------`);
      console.log(`📧 [Dev Email Notification Dispatch]`);
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Content:\n${payload.text || payload.html}`);
      console.log(`----------------------------------------`);
      return true;
    }
  }

  async sendApplicationStatusEmail(userEmail: string, company: string, position: string, newStatus: string) {
    return this.sendEmail({
      to: userEmail,
      subject: `Application Update: ${position} at ${company}`,
      html: `
        <h2>Application Status Changed</h2>
        <p>Your application for <strong>${position}</strong> at <strong>${company}</strong> has changed to: <strong>${newStatus}</strong>.</p>
        <p>Log in to your <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/applications">Application Tracker</a> to manage your next steps.</p>
      `,
      text: `Your application for ${position} at ${company} has changed to: ${newStatus}. Check your tracker for details.`,
    });
  }

  async sendReminderEmail(userEmail: string, title: string, dueDate: Date, details?: string) {
    return this.sendEmail({
      to: userEmail,
      subject: `Reminder: ${title}`,
      html: `
        <h2>Upcoming Reminder</h2>
        <p><strong>${title}</strong></p>
        <p>Due Date: ${new Date(dueDate).toLocaleString()}</p>
        ${details ? `<p>Details: ${details}</p>` : ""}
        <p>Access your dashboard at <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}">Internship Tracker</a>.</p>
      `,
      text: `Reminder: ${title} is due on ${new Date(dueDate).toLocaleString()}.`,
    });
  }
}

export const emailService = new EmailService();
