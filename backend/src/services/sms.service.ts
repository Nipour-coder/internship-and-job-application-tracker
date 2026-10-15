interface SmsPayload {
  to: string;
  message: string;
}

class SmsService {
  private isConfigured: boolean = false;
  private accountSid?: string;
  private authToken?: string;
  private fromNumber?: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (this.accountSid && this.authToken && this.fromNumber) {
      this.isConfigured = true;
      console.log("📱 SMS service initialized with Twilio provider.");
    } else {
      console.log("ℹ️  Twilio credentials not provided in .env. SMS service operating in Development / Console mode.");
    }
  }

  async sendSms(payload: SmsPayload): Promise<boolean> {
    if (this.isConfigured) {
      try {
        // Twilio REST API integration
        const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");
        
        const params = new URLSearchParams();
        params.append("To", payload.to);
        params.append("From", this.fromNumber!);
        params.append("Body", payload.message);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        if (!response.ok) {
          throw new Error(`Twilio returned error status: ${response.status}`);
        }

        console.log(`📱 [Sent SMS] To: ${payload.to} | Message: ${payload.message}`);
        return true;
      } catch (error) {
        console.error("Failed to send real SMS:", error);
        return false;
      }
    } else {
      // Development mode logging
      console.log(`----------------------------------------`);
      console.log(`📱 [Dev SMS Notification Dispatch]`);
      console.log(`To: ${payload.to}`);
      console.log(`Message: ${payload.message}`);
      console.log(`----------------------------------------`);
      return true;
    }
  }

  async sendReminderSms(phoneNumber: string, title: string, dueDate: Date) {
    return this.sendSms({
      to: phoneNumber,
      message: `[Tracker Alert] Reminder: "${title}" is scheduled for ${new Date(dueDate).toLocaleDateString()} at ${new Date(dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    });
  }
}

export const smsService = new SmsService();
