import { prisma, testDbConnection } from "../utils/prisma";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Local storage fallback path for when Neon DB is not yet connected
const LOCAL_DB_FILE = path.join(__dirname, "../../.dev-db.json");

interface FallbackData {
  users: any[];
  applications: any[];
  jobs: any[];
  savedJobs: any[];
  cvs: any[];
  reminders: any[];
  notifications: any[];
  notificationPreferences: any[];
  jobSearchPreferences: any[];
}

let isPrismaAvailable: boolean | null = null;

function loadLocalData(): FallbackData {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const content = fs.readFileSync(LOCAL_DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading local db file, initializing empty:", e);
  }
  return {
    users: [],
    applications: [],
    jobs: [],
    savedJobs: [],
    cvs: [],
    reminders: [],
    notifications: [],
    notificationPreferences: [],
    jobSearchPreferences: [],
  };
}

function saveLocalData(data: FallbackData) {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving local db file:", e);
  }
}

let localData = loadLocalData();

export async function checkPrismaStatus(): Promise<boolean> {
  if (isPrismaAvailable !== null) return isPrismaAvailable;
  isPrismaAvailable = await testDbConnection();
  if (isPrismaAvailable) {
    console.log("✅ Successfully connected to Neon PostgreSQL via Prisma.");
  } else {
    console.log("ℹ️  Neon PostgreSQL not reachable or credentials not yet provided in .env.");
    console.log("📁 Utilizing local persistent development store (.dev-db.json) for all data models.");
  }
  return isPrismaAvailable;
}

export const dbService = {
  // USER METHODS
  async findUserByEmail(email: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    }
    return localData.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, fullName: true, avatarUrl: true, createdAt: true },
      });
    }
    const u = localData.users.find((user) => user.id === id);
    if (!u) return null;
    const { passwordHash, ...safeUser } = u;
    return safeUser;
  },

  async createUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    avatarUrl?: string;
  }) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl,
          notificationPreference: {
            create: {},
          },
          jobSearchPreference: {
            create: {},
          },
        },
      });
    }
    const newUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 10),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      avatarUrl: data.avatarUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localData.users.push(newUser);
    localData.notificationPreferences.push({
      id: "np_" + Math.random().toString(36).substring(2, 10),
      userId: newUser.id,
      emailNotifications: true,
      smsNotifications: false,
      jobAlerts: true,
      interviewReminders: true,
      applicationReminders: true,
      statusChangeNotifications: true,
    });
    localData.jobSearchPreferences.push({
      id: "jsp_" + Math.random().toString(36).substring(2, 10),
      userId: newUser.id,
      keywords: "",
      desiredRoles: "",
      location: "",
      jobType: "INTERNSHIP",
      isRemote: false,
    });
    saveLocalData(localData);
    return newUser;
  },

  // APPLICATION METHODS
  async getApplications(userId: string, options?: { status?: string; sort?: string; search?: string }) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      const where: any = { userId };
      if (options?.status && options.status !== "ALL") {
        where.status = options.status.toUpperCase();
      }
      if (options?.search) {
        where.OR = [
          { company: { contains: options.search, mode: "insensitive" } },
          { position: { contains: options.search, mode: "insensitive" } },
        ];
      }
      const orderBy = options?.sort === "oldest" ? { dateApplied: "asc" as const } : { dateApplied: "desc" as const };
      return prisma.application.findMany({ where, orderBy });
    }

    let items = localData.applications.filter((a) => a.userId === userId);
    if (options?.status && options.status !== "ALL") {
      items = items.filter((a) => a.status.toUpperCase() === options.status?.toUpperCase());
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      items = items.filter(
        (a) => a.company?.toLowerCase().includes(q) || a.position?.toLowerCase().includes(q)
      );
    }
    if (options?.sort === "oldest") {
      items.sort((a, b) => new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime());
    } else {
      items.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
    }
    return items;
  },

  async getApplicationById(id: string, userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.application.findFirst({ where: { id, userId } });
    }
    return localData.applications.find((a) => a.id === id && a.userId === userId) || null;
  },

  async getApplicationStats(userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      const [total, applied, interview, offer, rejected] = await Promise.all([
        prisma.application.count({ where: { userId } }),
        prisma.application.count({ where: { userId, status: "APPLIED" } }),
        prisma.application.count({ where: { userId, status: "INTERVIEW" } }),
        prisma.application.count({ where: { userId, status: "OFFER" } }),
        prisma.application.count({ where: { userId, status: "REJECTED" } }),
      ]);
      return { total, applied, interview, offer, rejected };
    }

    const apps = localData.applications.filter((a) => a.userId === userId);
    return {
      total: apps.length,
      applied: apps.filter((a) => a.status === "APPLIED").length,
      interview: apps.filter((a) => a.status === "INTERVIEW").length,
      offer: apps.filter((a) => a.status === "OFFER").length,
      rejected: apps.filter((a) => a.status === "REJECTED").length,
    };
  },

  async createApplication(userId: string, data: any) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.application.create({
        data: {
          userId,
          company: data.company,
          position: data.position,
          location: data.location || null,
          status: (data.status || "APPLIED").toUpperCase(),
          dateApplied: data.dateApplied ? new Date(data.dateApplied) : new Date(),
          notes: data.notes || null,
          jobUrl: data.jobUrl || null,
          salary: data.salary || null,
        },
      });
    }

    const newApp = {
      id: "app_" + Math.random().toString(36).substring(2, 10),
      userId,
      company: data.company,
      position: data.position,
      location: data.location || null,
      status: (data.status || "APPLIED").toUpperCase(),
      dateApplied: data.dateApplied ? new Date(data.dateApplied).toISOString() : new Date().toISOString(),
      notes: data.notes || null,
      jobUrl: data.jobUrl || null,
      salary: data.salary || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localData.applications.push(newApp);
    saveLocalData(localData);
    return newApp;
  },

  async updateApplication(id: string, userId: string, data: any) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      await prisma.application.updateMany({
        where: { id, userId },
        data: {
          ...data,
          status: data.status ? data.status.toUpperCase() : undefined,
          dateApplied: data.dateApplied ? new Date(data.dateApplied) : undefined,
        },
      });
      return prisma.application.findFirst({ where: { id, userId } });
    }

    const idx = localData.applications.findIndex((a) => a.id === id && a.userId === userId);
    if (idx === -1) return null;
    localData.applications[idx] = {
      ...localData.applications[idx],
      ...data,
      status: data.status ? data.status.toUpperCase() : localData.applications[idx].status,
      updatedAt: new Date().toISOString(),
    };
    saveLocalData(localData);
    return localData.applications[idx];
  },

  async deleteApplication(id: string, userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.application.deleteMany({ where: { id, userId } });
    }

    const initialLen = localData.applications.length;
    localData.applications = localData.applications.filter((a) => !(a.id === id && a.userId === userId));
    saveLocalData(localData);
    return localData.applications.length < initialLen;
  },

  // JOBS METHODS
  async getJobs(options?: { keyword?: string; location?: string; jobType?: string; isRemote?: boolean }) {
    const isDb = await checkPrismaStatus();
    const now = new Date();

    if (isDb) {
      const where: any = {
        AND: [
          // Filter 1: Must NOT be expired (if closingDate is set, closingDate >= now)
          {
            OR: [
              { closingDate: null },
              { closingDate: { gte: now } },
            ],
          },
          // Filter 2: Must be advertised in South Africa or Remote Eligible
          {
            OR: [
              { location: { contains: "South Africa", mode: "insensitive" } },
              { location: { contains: "Johannesburg", mode: "insensitive" } },
              { location: { contains: "Cape Town", mode: "insensitive" } },
              { location: { contains: "Durban", mode: "insensitive" } },
              { location: { contains: "Pretoria", mode: "insensitive" } },
              { location: { contains: "Sandton", mode: "insensitive" } },
              { location: { contains: "Midrand", mode: "insensitive" } },
              { location: { contains: "Stellenbosch", mode: "insensitive" } },
              { location: { contains: "Centurion", mode: "insensitive" } },
              { location: { contains: "Bloemfontein", mode: "insensitive" } },
              { location: { contains: "Gauteng", mode: "insensitive" } },
              { isRemote: true },
            ],
          },
        ],
      };

      if (options?.keyword) {
        where.AND.push({
          OR: [
            { title: { contains: options.keyword, mode: "insensitive" } },
            { company: { contains: options.keyword, mode: "insensitive" } },
            { description: { contains: options.keyword, mode: "insensitive" } },
          ],
        });
      }
      if (options?.location) {
        where.AND.push({ location: { contains: options.location, mode: "insensitive" } });
      }
      if (options?.jobType && options.jobType !== "ALL") {
        where.AND.push({ jobType: options.jobType.toUpperCase() });
      }
      if (options?.isRemote !== undefined) {
        where.AND.push({ isRemote: options.isRemote });
      }
      return prisma.job.findMany({ where, orderBy: { createdAt: "desc" } });
    }

    let items = [...localData.jobs];
    // Exclude jobs whose application date has passed
    items = items.filter((j) => !j.closingDate || new Date(j.closingDate).getTime() >= Date.now());
    // Exclude non-SA jobs
    items = items.filter((j) => {
      if (j.isRemote) return true;
      const loc = (j.location || "").toLowerCase();
      return (
        loc.includes("south africa") ||
        loc.includes("johannesburg") ||
        loc.includes("cape town") ||
        loc.includes("durban") ||
        loc.includes("pretoria") ||
        loc.includes("sandton") ||
        loc.includes("midrand") ||
        loc.includes("stellenbosch")
      );
    });

    if (options?.keyword) {
      const q = options.keyword.toLowerCase();
      items = items.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q)
      );
    }
    if (options?.location) {
      const loc = options.location.toLowerCase();
      items = items.filter((j) => j.location?.toLowerCase().includes(loc));
    }
    if (options?.jobType && options.jobType !== "ALL") {
      items = items.filter((j) => j.jobType?.toUpperCase() === options.jobType?.toUpperCase());
    }
    if (options?.isRemote !== undefined) {
      items = items.filter((j) => j.isRemote === options.isRemote);
    }
    return items;
  },

  async getJobById(id: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.job.findUnique({ where: { id } });
    }
    return localData.jobs.find((j) => j.id === id) || null;
  },

  async upsertJobs(jobsList: any[]) {
    if (!jobsList || jobsList.length === 0) return;
    const isDb = await checkPrismaStatus();
    if (isDb) {
      try {
        const existingList = await prisma.job.findMany({
          select: { id: true, title: true, company: true },
        });
        const existingMap = new Map<string, string>();
        for (const item of existingList) {
          existingMap.set(`${item.company.toLowerCase().trim()}:::${item.title.toLowerCase().trim()}`, item.id);
        }

        const toCreate: any[] = [];
        for (const j of jobsList) {
          const key = `${(j.company || "").toLowerCase().trim()}:::${(j.title || "").toLowerCase().trim()}`;
          const closingDate = j.closingDate ? new Date(j.closingDate) : null;

          if (!existingMap.has(key)) {
            toCreate.push({
              title: j.title,
              company: j.company,
              location: j.location || "South Africa",
              description: j.description || "",
              requirements: j.requirements || null,
              jobType: j.jobType || "INTERNSHIP",
              closingDate,
              source: j.source || "Aggregator",
              applicationUrl: j.applicationUrl || "#",
              isRemote: j.isRemote ?? false,
            });
            existingMap.set(key, "pending");
          }
        }

        if (toCreate.length > 0) {
          await prisma.job.createMany({
            data: toCreate,
            skipDuplicates: true,
          });
        }
      } catch (err) {
        console.error("Batch upsert jobs error:", err);
      }
      return;
    }

    for (const j of jobsList) {
      const idx = localData.jobs.findIndex(
        (item) => item.title === j.title && item.company === j.company
      );
      if (idx === -1) {
        localData.jobs.unshift({
          id: "job_" + Math.random().toString(36).substring(2, 10),
          title: j.title,
          company: j.company,
          location: j.location || "South Africa",
          description: j.description || "",
          requirements: j.requirements || null,
          jobType: j.jobType || "INTERNSHIP",
          closingDate: j.closingDate ? new Date(j.closingDate).toISOString() : null,
          source: j.source || "Aggregator",
          applicationUrl: j.applicationUrl || "#",
          isRemote: j.isRemote ?? false,
          createdAt: new Date().toISOString(),
        });
      } else {
        localData.jobs[idx] = {
          ...localData.jobs[idx],
          location: j.location || localData.jobs[idx].location,
          description: j.description || localData.jobs[idx].description,
          closingDate: j.closingDate ? new Date(j.closingDate).toISOString() : localData.jobs[idx].closingDate,
          applicationUrl: j.applicationUrl || localData.jobs[idx].applicationUrl,
          isRemote: j.isRemote ?? localData.jobs[idx].isRemote,
        };
      }
    }
    saveLocalData(localData);
  },

  // SAVED JOBS METHODS
  async getSavedJobs(userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.savedJob.findMany({
        where: { userId },
        include: { job: true },
        orderBy: { createdAt: "desc" },
      });
    }

    return localData.savedJobs
      .filter((s) => s.userId === userId)
      .map((s) => ({
        ...s,
        job: localData.jobs.find((j) => j.id === s.jobId),
      }));
  },

  async saveJob(userId: string, jobId: string, notes?: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.savedJob.upsert({
        where: { userId_jobId: { userId, jobId } },
        update: { notes },
        create: { userId, jobId, notes },
      });
    }

    const existingIdx = localData.savedJobs.findIndex((s) => s.userId === userId && s.jobId === jobId);
    if (existingIdx !== -1) {
      localData.savedJobs[existingIdx].notes = notes;
      saveLocalData(localData);
      return localData.savedJobs[existingIdx];
    }
    const newSaved = {
      id: "saved_" + Math.random().toString(36).substring(2, 10),
      userId,
      jobId,
      notes: notes || null,
      createdAt: new Date().toISOString(),
    };
    localData.savedJobs.push(newSaved);
    saveLocalData(localData);
    return newSaved;
  },

  async removeSavedJob(id: string, userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.savedJob.deleteMany({
        where: {
          OR: [
            { id, userId },
            { jobId: id, userId },
          ],
        },
      });
    }

    const initialLen = localData.savedJobs.length;
    localData.savedJobs = localData.savedJobs.filter(
      (s) => !(s.userId === userId && (s.id === id || s.jobId === id))
    );
    saveLocalData(localData);
    return localData.savedJobs.length < initialLen;
  },

  // CV METHODS
  async getCV(userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.cV.findUnique({ where: { userId } });
    }
    return localData.cvs.find((c) => c.userId === userId) || null;
  },

  async upsertCV(userId: string, data: any) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.cV.upsert({
        where: { userId },
        update: { ...data },
        create: { userId, ...data },
      });
    }

    const idx = localData.cvs.findIndex((c) => c.userId === userId);
    const updated = {
      id: idx !== -1 ? localData.cvs[idx].id : "cv_" + Math.random().toString(36).substring(2, 10),
      userId,
      fullName: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      summary: data.summary || "",
      education: data.education || [],
      experience: data.experience || [],
      skills: data.skills || [],
      certifications: data.certifications || [],
      projects: data.projects || [],
      interests: data.interests || [],
      updatedAt: new Date().toISOString(),
    };
    if (idx !== -1) {
      localData.cvs[idx] = updated;
    } else {
      localData.cvs.push(updated);
    }
    saveLocalData(localData);
    return updated;
  },

  // REMINDERS METHODS
  async getReminders(userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.reminder.findMany({
        where: { userId },
        include: { application: true },
        orderBy: { dueDate: "asc" },
      });
    }

    return localData.reminders
      .filter((r) => r.userId === userId)
      .map((r) => ({
        ...r,
        application: r.applicationId
          ? localData.applications.find((a) => a.id === r.applicationId)
          : null,
      }))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  async createReminder(userId: string, data: any) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.reminder.create({
        data: {
          userId,
          title: data.title,
          dueDate: new Date(data.dueDate),
          reminderType: data.reminderType || "FOLLOW_UP",
          applicationId: data.applicationId || null,
        },
      });
    }

    const newReminder = {
      id: "rem_" + Math.random().toString(36).substring(2, 10),
      userId,
      title: data.title,
      dueDate: new Date(data.dueDate).toISOString(),
      reminderType: data.reminderType || "FOLLOW_UP",
      applicationId: data.applicationId || null,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    localData.reminders.push(newReminder);
    saveLocalData(localData);
    return newReminder;
  },

  async updateReminder(id: string, userId: string, data: any) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      await prisma.reminder.updateMany({
        where: { id, userId },
        data: {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
      });
      return prisma.reminder.findFirst({ where: { id, userId } });
    }

    const idx = localData.reminders.findIndex((r) => r.id === id && r.userId === userId);
    if (idx === -1) return null;
    localData.reminders[idx] = {
      ...localData.reminders[idx],
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : localData.reminders[idx].dueDate,
    };
    saveLocalData(localData);
    return localData.reminders[idx];
  },

  async deleteReminder(id: string, userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.reminder.deleteMany({ where: { id, userId } });
    }

    const initialLen = localData.reminders.length;
    localData.reminders = localData.reminders.filter((r) => !(r.id === id && r.userId === userId));
    saveLocalData(localData);
    return localData.reminders.length < initialLen;
  },

  // NOTIFICATION METHODS
  async getNotifications(userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    }

    return localData.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createNotification(userId: string, data: { title: string; message: string; type?: string }) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.notification.create({
        data: {
          userId,
          title: data.title,
          message: data.message,
          type: data.type || "INFO",
        },
      });
    }

    const newNotif = {
      id: "notif_" + Math.random().toString(36).substring(2, 10),
      userId,
      title: data.title,
      message: data.message,
      type: data.type || "INFO",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    localData.notifications.push(newNotif);
    saveLocalData(localData);
    return newNotif;
  },

  async markNotificationRead(id: string, userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });
    }

    const notif = localData.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      saveLocalData(localData);
    }
    return notif;
  },

  async markAllNotificationsRead(userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    }

    localData.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    saveLocalData(localData);
    return true;
  },

  // SETTINGS METHODS
  async getNotificationPreferences(userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.notificationPreference.findUnique({ where: { userId } });
    }
    return localData.notificationPreferences.find((p) => p.userId === userId) || null;
  },

  async updateNotificationPreferences(userId: string, data: any) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.notificationPreference.upsert({
        where: { userId },
        update: { ...data },
        create: { userId, ...data },
      });
    }

    const idx = localData.notificationPreferences.findIndex((p) => p.userId === userId);
    if (idx !== -1) {
      localData.notificationPreferences[idx] = { ...localData.notificationPreferences[idx], ...data };
    } else {
      localData.notificationPreferences.push({
        id: "np_" + Math.random().toString(36).substring(2, 10),
        userId,
        ...data,
      });
    }
    saveLocalData(localData);
    return localData.notificationPreferences.find((p) => p.userId === userId);
  },

  async getJobSearchPreferences(userId: string) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.jobSearchPreference.findUnique({ where: { userId } });
    }
    return localData.jobSearchPreferences.find((p) => p.userId === userId) || null;
  },

  async updateJobSearchPreferences(userId: string, data: any) {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.jobSearchPreference.upsert({
        where: { userId },
        update: { ...data },
        create: { userId, ...data },
      });
    }

    const idx = localData.jobSearchPreferences.findIndex((p) => p.userId === userId);
    if (idx !== -1) {
      localData.jobSearchPreferences[idx] = { ...localData.jobSearchPreferences[idx], ...data };
    } else {
      localData.jobSearchPreferences.push({
        id: "jsp_" + Math.random().toString(36).substring(2, 10),
        userId,
        ...data,
      });
    }
    saveLocalData(localData);
    return localData.jobSearchPreferences.find((p) => p.userId === userId);
  },

  // SCHEDULER & BATCH METHODS
  async getAllUsers() {
    const isDb = await checkPrismaStatus();
    if (isDb) {
      return prisma.user.findMany({
        select: { id: true, email: true, fullName: true },
      });
    }
    return localData.users.map((u) => ({ id: u.id, email: u.email, fullName: u.fullName }));
  },

  async getDueRemindersForUser(userId: string, windowMs: number = 24 * 60 * 60 * 1000) {
    const isDb = await checkPrismaStatus();
    const now = new Date();
    const threshold = new Date(now.getTime() + windowMs);

    if (isDb) {
      return prisma.reminder.findMany({
        where: {
          userId,
          isCompleted: false,
          dueDate: {
            lte: threshold,
          },
        },
        include: { application: true },
      });
    }

    return localData.reminders
      .filter(
        (r) =>
          r.userId === userId &&
          !r.isCompleted &&
          new Date(r.dueDate).getTime() <= threshold.getTime()
      )
      .map((r) => ({
        ...r,
        application: r.applicationId ? localData.applications.find((a) => a.id === r.applicationId) : null,
      }));
  },

  async getStagnantApplicationsForUser(userId: string, daysStagnant: number = 14) {
    const isDb = await checkPrismaStatus();
    const cutoff = new Date(Date.now() - daysStagnant * 24 * 60 * 60 * 1000);

    if (isDb) {
      return prisma.application.findMany({
        where: {
          userId,
          status: "APPLIED",
          dateApplied: {
            lte: cutoff,
          },
        },
      });
    }

    return localData.applications.filter(
      (a) =>
        a.userId === userId &&
        a.status === "APPLIED" &&
        new Date(a.dateApplied).getTime() <= cutoff.getTime()
    );
  },
};
