import cron from "node-cron";
import { dbService } from "./db.service";
import { emailService } from "./email.service";
import { smsService } from "./sms.service";

export class CronService {
  initScheduledJobs() {
    console.log("⏰ Initializing automated reminder and alert scheduler...");

    // Run every hour
    cron.schedule("0 * * * *", async () => {
      await this.processRemindersAndAlerts();
    });

    // Run once 5 seconds after server startup
    setTimeout(() => {
      this.processRemindersAndAlerts().catch((err) =>
        console.error("Error running initial reminder check:", err)
      );
    }, 5000);
  }

  async processRemindersAndAlerts() {
    try {
      const users = await dbService.getAllUsers();
      if (!users || users.length === 0) return;

      const now = new Date();

      for (const user of users) {
        const prefs = await dbService.getNotificationPreferences(user.id);
        const existingNotifs = await dbService.getNotifications(user.id);

        // 1. Process Due Reminders (Due within 24 hours)
        const dueReminders = await dbService.getDueRemindersForUser(user.id, 24 * 60 * 60 * 1000);
        for (const rem of dueReminders) {
          const alreadyNotified = existingNotifs.some(
            (n: any) =>
              n.message?.includes(rem.title) &&
              now.getTime() - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000
          );

          if (!alreadyNotified) {
            await dbService.createNotification(user.id, {
              title: `Upcoming Reminder: ${rem.title}`,
              message: `Your reminder "${rem.title}" is due on ${new Date(rem.dueDate).toLocaleDateString()}.`,
              type: rem.reminderType || "REMINDER",
            });

            if (prefs?.emailNotifications && prefs?.applicationReminders) {
              await emailService.sendReminderEmail(user.email, rem.title, new Date(rem.dueDate));
            }
          }
        }

        // 2. Process Stagnant Applications (Status APPLIED >= 14 days ago)
        const stagnantApps = await dbService.getStagnantApplicationsForUser(user.id, 14);
        for (const app of stagnantApps) {
          const alreadySuggested = existingNotifs.some(
            (n: any) =>
              n.message?.includes(app.company) &&
              n.type === "FOLLOW_UP" &&
              now.getTime() - new Date(n.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
          );

          if (!alreadySuggested) {
            await dbService.createNotification(user.id, {
              title: `Follow-up Suggestion: ${app.company}`,
              message: `It has been over 14 days since you applied for ${app.position} at ${app.company}. Consider reaching out with a polite follow-up.`,
              type: "FOLLOW_UP",
            });

            if (prefs?.emailNotifications && prefs?.applicationReminders) {
              await emailService.sendEmail({
                to: user.email,
                subject: `Application Follow-up: ${app.position} at ${app.company}`,
                html: `
                  <h2>Follow-up Suggestion</h2>
                  <p>It has been over 14 days since you submitted your application for <strong>${app.position}</strong> at <strong>${app.company}</strong>.</p>
                  <p>A polite follow-up email to the recruiter or hiring team can demonstrate continued enthusiasm.</p>
                  <p>View your application in your <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/applications/${app.id}">Tracker</a>.</p>
                `,
                text: `It has been over 14 days since you applied for ${app.position} at ${app.company}. Consider sending a polite follow-up message.`,
              });
            }
          }
        }
      }

      console.log(`⏰ [Scheduler] Routine check completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error("Scheduler error during reminder check:", error);
    }
  }

  async triggerStatusChangeAlert(userId: string, company: string, position: string, newStatus: string) {
    try {
      const user = await dbService.findUserById(userId);
      if (!user) return;

      const prefs = await dbService.getNotificationPreferences(userId);

      // 1. Create In-App Notification
      await dbService.createNotification(userId, {
        title: `Application Status: ${company}`,
        message: `Your application for ${position} at ${company} was updated to "${newStatus}".`,
        type: "STATUS_CHANGE",
      });

      // 2. Email alert if preference enabled
      if (prefs?.emailNotifications && prefs?.statusChangeNotifications) {
        await emailService.sendApplicationStatusEmail(user.email, company, position, newStatus);
      }
    } catch (e) {
      console.error("Error triggering status change alert:", e);
    }
  }
}

export const cronService = new CronService();
