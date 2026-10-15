import request from "supertest";
import app from "../src/server";
import { cronService } from "../src/services/cron.service";

jest.setTimeout(25000);

describe("Internship & Job Application Tracker Backend API", () => {
  const testUser = {
    fullName: "Alex Student",
    email: `alex_${Date.now()}@university.edu`,
    password: "Password123!",
    confirmPassword: "Password123!",
  };

  const otherUser = {
    fullName: "Jordan Peer",
    email: `jordan_${Date.now()}@university.edu`,
    password: "Password123!",
    confirmPassword: "Password123!",
  };

  let token = "";
  let otherToken = "";
  let createdAppId = "";

  it("GET /api/health should return ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  describe("Authentication Flow & User Registration", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      token = res.body.token;
    });

    it("should reject registration if email already exists", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should log in an existing user with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "WrongPassword999!",
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return the current user profile on GET /api/auth/me", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.fullName).toBe("Alex Student");
    });

    it("should register the second test user for data isolation testing", async () => {
      const res = await request(app).post("/api/auth/register").send(otherUser);
      expect(res.status).toBe(201);
      otherToken = res.body.token;
    });
  });

  describe("Applications Tracker & User Data Isolation", () => {
    it("should allow a student to create an internship application", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          company: "Google",
          position: "Software Engineering Intern - 2025",
          location: "London, UK",
          status: "APPLIED",
          dateApplied: new Date().toISOString(),
          notes: "Applied via campus recruiting portal.",
          jobUrl: "https://careers.google.com/jobs",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.application.company).toBe("Google");
      createdAppId = res.body.application.id;
    });

    it("should accurately report dashboard statistics", async () => {
      const res = await request(app)
        .get("/api/applications/stats")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.total).toBeGreaterThanOrEqual(1);
      expect(res.body.stats.applied).toBeGreaterThanOrEqual(1);
    });

    it("should enforce strict data isolation: other user cannot see Alex's applications", async () => {
      const res = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      // Other user should have 0 applications
      expect(res.body.applications.length).toBe(0);
    });

    it("should allow editing application status to INTERVIEW", async () => {
      const res = await request(app)
        .put(`/api/applications/${createdAppId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          status: "INTERVIEW",
          notes: "Received invitation for technical round 1.",
        });

      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe("INTERVIEW");
    });
  });

  describe("Job Search and Saved Jobs", () => {
    let sampleJobId = "";

    it("should fetch job opportunities catalog", async () => {
      const res = await request(app).get("/api/jobs");
      expect(res.status).toBe(200);
      expect(res.body.jobs.length).toBeGreaterThan(0);
      sampleJobId = res.body.jobs[0].id;
    });

    it("should save a job to user's bookmarks", async () => {
      const res = await request(app)
        .post("/api/saved-jobs")
        .set("Authorization", `Bearer ${token}`)
        .send({ jobId: sampleJobId, notes: "Top target company" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should convert a saved job into an application", async () => {
      const res = await request(app)
        .post(`/api/saved-jobs/${sampleJobId}/convert`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.application.position).toBeDefined();
    });
  });

  describe("CV Builder", () => {
    it("should fetch initial CV data for user", async () => {
      const res = await request(app)
        .get("/api/cv")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.cv.fullName).toBe("Alex Student");
    });

    it("should save structured CV sections", async () => {
      const res = await request(app)
        .post("/api/cv")
        .set("Authorization", `Bearer ${token}`)
        .send({
          fullName: "Alex Student",
          email: testUser.email,
          phone: "+44 7123 456789",
          location: "London, UK",
          summary: "Passionate Computer Science student seeking software engineering internships.",
          skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
          education: [
            {
              institution: "Imperial College London",
              qualification: "BSc Computing",
              startDate: "2023",
              endDate: "2026",
              description: "First-year average: 82%",
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.cv.skills).toContain("TypeScript");
    });
  });

  describe("Reminders and Notifications", () => {
    let reminderId = "";

    it("should create a reminder for an application", async () => {
      const res = await request(app)
        .post("/api/reminders")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Follow up with recruiter",
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          reminderType: "FOLLOW_UP",
          applicationId: createdAppId,
        });

      expect(res.status).toBe(201);
      reminderId = res.body.reminder.id;
    });

    it("should mark a reminder as completed", async () => {
      const res = await request(app)
        .put(`/api/reminders/${reminderId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ isCompleted: true });

      expect(res.status).toBe(200);
      expect(res.body.reminder.isCompleted).toBe(true);
    });

    it("should fetch user notifications", async () => {
      const res = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    it("should mark all user notifications as read", async () => {
      const res = await request(app)
        .put("/api/notifications/read-all")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Settings & User Preferences", () => {
    it("should fetch user notification preferences", async () => {
      const res = await request(app)
        .get("/api/settings/notifications")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.preferences).toBeDefined();
    });

    it("should update user notification preferences", async () => {
      const res = await request(app)
        .put("/api/settings/notifications")
        .set("Authorization", `Bearer ${token}`)
        .send({
          emailNotifications: true,
          smsNotifications: false,
          applicationReminders: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.preferences.emailNotifications).toBe(true);
    });

    it("should fetch user job search preferences", async () => {
      const res = await request(app)
        .get("/api/settings/job-preferences")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.preferences).toBeDefined();
    });

    it("should update user job search preferences", async () => {
      const res = await request(app)
        .put("/api/settings/job-preferences")
        .set("Authorization", `Bearer ${token}`)
        .send({
          keywords: "Frontend Developer",
          location: "Cape Town",
          isRemote: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.preferences.keywords).toBe("Frontend Developer");
    });
  });

  describe("Automated Background Scheduler & Alerts", () => {
    it("should execute routine check without error and process due reminders", async () => {
      await expect(cronService.processRemindersAndAlerts()).resolves.not.toThrow();
    });
  });
});

