import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import applicationsRoutes from "./routes/applications.routes";
import jobsRoutes from "./routes/jobs.routes";
import savedJobsRoutes from "./routes/savedJobs.routes";
import cvRoutes from "./routes/cv.routes";
import remindersRoutes from "./routes/reminders.routes";
import notificationsRoutes from "./routes/notifications.routes";
import settingsRoutes from "./routes/settings.routes";
import { errorHandler } from "./middleware/error.middleware";
import { cronService } from "./services/cron.service";
import { checkPrismaStatus } from "./services/db.service";

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// API Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Internship & Job Application Tracker API",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/saved-jobs", savedJobsRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/settings", settingsRoutes);

// Centralized Error Handling
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, async () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
    await checkPrismaStatus();
    cronService.initScheduledJobs();
  });
}

export default app;
