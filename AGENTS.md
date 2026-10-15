# AGENTS.md — Master Development Guide & System Specification

## 1. Project Name
- **Official Name:** Internship & Job Application Tracker
- **Internal / Repository Name:** `internship-job-tracker`

---

## 2. Project Description
The **Internship & Job Application Tracker** is a dedicated, full-stack productivity platform built to centralize and streamline the internship and early-career job search for students and graduates. Rather than juggling disparate spreadsheets, scattered browser bookmarks, email threads, and notebooks, students manage their end-to-end career journey inside one organized system. 

The platform brings together:
- Job application tracking with stage-by-stage pipelines (`Applied`, `Interview`, `Offer`, `Rejected`).
- Real-time job opportunity discovery and multi-source job board aggregation.
- A standardized, student-friendly manual CV builder with live preview and PDF export.
- User-specific saved opportunities convertible to applications with a single click.
- Automated deadline, follow-up, and status-change reminders.
- In-app notification center backed by modular Email and SMS notification capabilities.

---

## 3. Problem Being Solved
Early-career job seekers face distinct hurdles:
1. **Application Chaos:** Applying to dozens of internship programs across multiple job portals leads to missed deadlines, forgotten follow-ups, and confusion regarding which resume version or notes were submitted.
2. **Scattered Resources:** Job descriptions disappear once listings close, leaving candidates unprepared when invited for interviews.
3. **Overcomplicated Tools:** Enterprise customer-relationship management (CRM) software or generic project management boards are bloated, confusing, and lack student-specific workflows (e.g., CV creation, term-time availability, graduation date tracking).
4. **Lack of Automated Accountability:** Students frequently forget to send thank-you notes, follow up after two weeks of silence, or prepare for scheduled interviews.

This platform resolves these pain points by offering an intuitive, unified, student-centered command center with automated alerts and strict personal data isolation.

---

## 4. Target Users
The primary user audience encompasses:
- **University and College Students:** Seeking summer internships, spring weeks, co-ops, and industrial placements.
- **Recent Graduates:** Searching for graduate schemes, development programs, and junior full-time positions.
- **Internship Seekers:** Needing to track high application volumes across recruiting cycles.
- **Career Switchers & Entry-Level Job Seekers:** Managing their transition into entry-level tech and professional roles.

---

## 5. Project Objectives
1. **Centralize Applications:** Deliver a high-performance CRUD interface for tracking applications with dynamic status filtering, chronological sorting, and notes history.
2. **Empower Discovery:** Provide an integrated job search system with live external API querying and compliant public scraping capabilities.
3. **Facilitate Application Prep:** Provide a structured, manual CV builder that compiles education, work experience, projects, skills, and certifications into a clean, downloadable PDF format without generative AI distractions.
4. **Automate Reminders & Alerts:** Run backend schedulers that compute overdue follow-ups, upcoming interview dates, and send alerts via in-app notifications, email, and SMS.
5. **Ensure Uncompromising Privacy:** Isolate 100% of user data at the database and query levels so no user can view or alter another candidate's records.
6. **Deliver Responsive Excellence:** Ensure every page is mobile-friendly across desktop, laptop, tablet, and mobile browsers.

---

## 6. Complete In-Scope Feature List (27 Items)
1. **User Registration:** Email, full name, password with confirmation, and security validation.
2. **User Login:** Secure authentication with credential verification and session management.
3. **Backend Authentication:** Server-side JWT issuing, cookie/header handling, bcrypt password hashing, and route guards.
4. **Social Login:** OAuth architecture prepared for Google and GitHub providers with secure backend token exchange.
5. **Internship/Job Application Tracking:** Full lifecycle tracking (Company, Title, Date Applied, Status, Notes, Job URL).
6. **Application CRUD:** Add, view, edit, and delete application records.
7. **Application Status Management:** State transitions across `Applied`, `Interview`, `Offer`, `Rejected`.
8. **Application Filtering:** Instant filtering across `All`, `Applied`, `Interview`, `Offer`, and `Rejected`.
9. **Application Sorting:** Chronological ordering by Newest First and Oldest First.
10. **Modern Dashboard:** Real-time statistics counters, recent applications, upcoming interviews, saved jobs, recent opportunities, and pending reminders.
11. **Resume/CV Builder:** Structured input for Personal Info, Professional Summary, Education, Experience, Skills, Certifications, Projects, and Interests.
12. **CV Live Preview:** High-fidelity real-time rendering of the user's formatted resume.
13. **CV PDF Generation & Download:** Direct client/server PDF generation and download capability.
14. **Job Searching:** Dedicated job discovery board with keyword, job title, location, type (Internship, Graduate, Junior), and remote/on-site filters.
15. **Automated Job Searching:** User-configurable job search preferences utilized by background routines.
16. **Job Board Scraping:** Backend web scraping service pulling public opportunities from compliant job boards.
17. **Web Scraping Infrastructure:** Modular backend scraping architecture respecting `robots.txt`, legal guidelines, and technical bounds.
18. **External Job APIs:** Backend adapters integrating external job provider APIs with unified internal data normalization.
19. **Saved Jobs:** Ability to bookmark job postings, review saved listings, remove them, or convert them into active applications.
20. **Automated Status-Change Reminders:** Background cron detection for stagnant applications, follow-ups after X days, and deadline warnings.
21. **Interview Reminders:** Time-triggered alerts for scheduled interview dates.
22. **Email Integration:** Modular transactional email provider architecture (Nodemailer, SendGrid, Resend) for alerts and reminders.
23. **SMS Integration:** Modular SMS provider architecture (Twilio) for critical deadline and interview notifications.
24. **Automated Email Notifications:** Scheduled dispatch of status change alerts, job matches, and follow-up digests.
25. **Notification Settings / Preferences:** User-level toggles for Email, SMS, job alerts, interview alerts, and application updates.
26. **User Account Management:** Profile view, account detail updates, password change, and session logout.
27. **Responsive Mobile Web Application:** Mobile-optimized UI with fluid layouts, touch targets, and responsive drawer navigation.

---

## 7. Complete Out-of-Scope Feature List (10 Items)
The following are strictly out-of-scope:
1. **AI Job Recommendations:** No black-box machine learning recommendation models.
2. **AI CV Generation:** No LLM-generated resumes; all information is manually curated by the user.
3. **AI Cover-Letter Generation:** No AI-generated text or prompts.
4. **Chat Functionality:** No live user-to-user or recruiter chat.
5. **Payment Functionality:** No payment gateways, paywalls, or billing plans.
6. **Complex Analytics:** No complex business intelligence metrics or confusing multi-variable graphs.
7. **Complex Dashboard Charts:** No nested or slow-rendering canvas charting libraries.
8. **Cryptocurrency Functionality:** No web3, wallets, or token integrations.
9. **Unrelated Social Networking:** No social feeds, public posts, or follower graphs.
10. **Unrelated Business-Management Functionality:** No candidate management for employers or enterprise HR features.

---

## 8. Technology Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Library:** React 19 / 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State & Data Fetching:** React Hooks (`useState`, `useEffect`, `useCallback`, `useContext`) + native `fetch` client

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma ORM
- **Password Security:** `bcryptjs`
- **Session/Token Management:** `jsonwebtoken` (JWT)
- **Validation:** Zod schemas
- **Scheduled Tasks:** `node-cron`
- **Web Scraping:** `axios` + `cheerio`
- **Email Dispatch:** `nodemailer`
- **HTTP Security:** `helmet`, `cors`

### Database
- **Provider:** PostgreSQL / Neon Serverless PostgreSQL
- **Connection Mode:** Connection pooling via `DATABASE_URL`

### Deployment
- **Frontend:** Vercel
- **Backend:** Render (or compatible container/PaaS hosting)
- **Database:** Neon Console

---

## 9. Frontend Architecture
- **Next.js App Router Structure:**
  - Route groups: `(auth)` for public authentication flows; root app directory for authenticated application experiences.
  - Client Components: Used for interactive forms, modals, filter bars, and stateful widgets (`"use client"`).
  - Server Layouts: Providing global context, metadata, and CSS imports.
- **State Management:**
  - `AuthContext`: Manages logged-in user profile, JWT token lifecycle, and login/logout state transitions.
  - Local state for forms, pagination, active filter criteria, and delete-confirmation modals.
- **API Client (`lib/api.ts`):**
  - Wrapper around `fetch` that automatically injects the `Authorization: Bearer <token>` header, handles 401 unauthenticated redirects, parses JSON responses, and returns structured errors.
- **Responsive Layout System:**
  - Desktop: Persistent left-hand collapsible sidebar with clear active route indicators.
  - Mobile: Top navigation bar with a hamburger drawer / bottom bar and accessible dismiss actions.

---

## 10. Backend Architecture
- **Layered Architecture:**
  - `routes/`: Express route definitions mapping HTTP methods and URL paths to controllers and validation middlewares.
  - `controllers/`: Request handling, parameter extraction, invocation of business logic services, and HTTP response formatting.
  - `services/`: Core business logic, Prisma database operations, external API calls, scraper routines, and email/SMS triggers.
  - `middleware/`: Authentication guard (`auth.middleware.ts`), error handler (`error.middleware.ts`), rate limiter, and CORS/security headers.
  - `models/` & `prisma/`: Prisma schema and database clients.
  - `utils/`: JWT generation/verification, password hashing, and logging helpers.

---

## 11. Database Architecture & Schema
Neon PostgreSQL managed via Prisma. All tables enforce strict foreign key constraints and user ownership.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ApplicationStatus {
  APPLIED
  INTERVIEW
  OFFER
  REJECTED
}

enum JobType {
  INTERNSHIP
  GRADUATE
  ENTRY_LEVEL
  JUNIOR
  FULL_TIME
  PART_TIME
}

enum ReminderType {
  FOLLOW_UP
  INTERVIEW
  DEADLINE
  CUSTOM
}

model User {
  id                     String                  @id @default(uuid())
  email                  String                  @unique
  passwordHash           String
  fullName               String
  avatarUrl              String?
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt

  applications           Application[]
  savedJobs              SavedJob[]
  cv                     CV?
  reminders              Reminder[]
  notifications          Notification[]
  notificationPreference NotificationPreference?
  jobSearchPreference    JobSearchPreference?
}

model Application {
  id          String            @id @default(uuid())
  userId      String
  company     String
  position    String
  location    String?
  status      ApplicationStatus @default(APPLIED)
  dateApplied DateTime          @default(now())
  notes       String?           @db.Text
  jobUrl      String?
  salary      String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  reminders   Reminder[]
}

model Job {
  id             String     @id @default(uuid())
  title          String
  company        String
  location       String
  description    String     @db.Text
  requirements   String?    @db.Text
  jobType        JobType    @default(INTERNSHIP)
  closingDate    DateTime?
  source         String
  applicationUrl String
  isRemote       Boolean    @default(false)
  createdAt      DateTime   @default(now())

  savedByUsers   SavedJob[]
}

model SavedJob {
  id        String   @id @default(uuid())
  userId    String
  jobId     String
  notes     String?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  job       Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@unique([userId, jobId])
}

model CV {
  id             String   @id @default(uuid())
  userId         String   @unique
  fullName       String
  email          String
  phone          String?
  location       String?
  summary        String?  @db.Text
  education      Json     @default("[]")
  experience     Json     @default("[]")
  skills         Json     @default("[]")
  certifications Json     @default("[]")
  projects       Json     @default("[]")
  interests      Json     @default("[]")
  updatedAt      DateTime @updatedAt

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Reminder {
  id            String       @id @default(uuid())
  userId        String
  applicationId String?
  title         String
  dueDate       DateTime
  reminderType  ReminderType @default(FOLLOW_UP)
  isCompleted   Boolean      @default(false)
  createdAt     DateTime     @default(now())

  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  application   Application? @relation(fields: [applicationId], references: [id], onDelete: SetNull)
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  message   String
  type      String   @default("INFO")
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model NotificationPreference {
  id                        String  @id @default(uuid())
  userId                    String  @unique
  emailNotifications        Boolean @default(true)
  smsNotifications          Boolean @default(false)
  jobAlerts                 Boolean @default(true)
  interviewReminders        Boolean @default(true)
  applicationReminders      Boolean @default(true)
  statusChangeNotifications Boolean @default(true)

  user                      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model JobSearchPreference {
  id           String    @id @default(uuid())
  userId       String    @unique
  keywords     String?
  desiredRoles String?
  location     String?
  jobType      JobType?
  isRemote     Boolean   @default(false)

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 12. Authentication Architecture
1. **Password Hashing:** `bcryptjs` with salt round >= 10. Passwords are never logged or stored in plaintext.
2. **Token Generation:** `jsonwebtoken` signs a JWT containing `{ id: user.id, email: user.email }` with a configurable expiration (e.g. 7 days).
3. **Route Protection:** Express middleware `authenticateToken` checks `Authorization: Bearer <token>`. If invalid or expired, returns `401 Unauthorized`.
4. **Current User Endpoint:** `GET /api/auth/me` verifies the token and returns non-sensitive user profile data.
5. **Social Login Flow:** OAuth endpoint structure prepared for Google and GitHub. The frontend initiates redirect, the backend handles OAuth callback, exchanges authorization code for user profile, upserts the user in the database, and issues an internal JWT.

---

## 13. API Structure

### Auth (`/api/auth`)
- `POST /api/auth/register` — Create account with name, email, password.
- `POST /api/auth/login` — Authenticate and receive JWT token + user object.
- `POST /api/auth/logout` — Invalidate client session / cookie.
- `GET  /api/auth/me` — Return current authenticated user.
- `GET  /api/auth/google` & `GET /api/auth/github` — OAuth redirection.
- `GET  /api/auth/callback/:provider` — OAuth provider callback exchange.

### Applications (`/api/applications`)
- `GET    /api/applications` — List user's applications (supports `?status=&sort=newest|oldest&search=`).
- `GET    /api/applications/stats` — Return counters: Total, Applied, Interview, Offer, Rejected.
- `GET    /api/applications/:id` — Get single application details.
- `POST   /api/applications` — Create new application.
- `PUT    /api/applications/:id` — Update application details or status.
- `DELETE /api/applications/:id` — Delete application (with ownership check).

### Jobs (`/api/jobs`)
- `GET    /api/jobs` — Retrieve paginated/filtered list of available opportunities.
- `GET    /api/jobs/search` — Search jobs across internal DB, external APIs, and live scrapers.
- `GET    /api/jobs/:id` — View specific job listing.

### Saved Jobs (`/api/saved-jobs`)
- `GET    /api/saved-jobs` — List all jobs saved by the user.
- `POST   /api/saved-jobs` — Save a job (`{ jobId, notes }`).
- `DELETE /api/saved-jobs/:id` — Remove saved job bookmark.
- `POST   /api/saved-jobs/:id/convert` — Convert saved job into an active application.

### CV Builder (`/api/cv`)
- `GET    /api/cv` — Get user's complete CV data.
- `POST   /api/cv` / `PUT /api/cv` — Upsert user's CV sections.

### Reminders (`/api/reminders`)
- `GET    /api/reminders` — Get upcoming and past reminders.
- `POST   /api/reminders` — Create new reminder (attached to an application or standalone).
- `PUT    /api/reminders/:id` — Update reminder details or toggle `isCompleted`.
- `DELETE /api/reminders/:id` — Remove reminder.

### Notifications (`/api/notifications`)
- `GET    /api/notifications` — Fetch user's notification list with unread counter.
- `PUT    /api/notifications/:id/read` — Mark a notification as read.
- `PUT    /api/notifications/read-all` — Mark all user notifications as read.

### Settings (`/api/settings`)
- `GET    /api/settings/notifications` — Retrieve notification preferences.
- `PUT    /api/settings/notifications` — Update notification preferences.
- `GET    /api/settings/job-preferences` — Retrieve automated search preferences.
- `PUT    /api/settings/job-preferences` — Update automated search preferences.

---

## 14. Security Requirements
1. **User Data Isolation:** Every database query affecting user-owned models MUST filter by `userId: req.user.id`. No client parameter can overwrite this ownership.
2. **Zero Plaintext Secrets:** No passwords, database credentials, API keys, or JWT secrets stored in source code or client bundles.
3. **Environment Security:** `NEXT_PUBLIC_*` prefix is strictly prohibited for backend secrets. Only the backend API base URL is exposed to the browser.
4. **Input Validation:** All input payloads (registration, applications, CV fields) are strictly validated with Zod before database execution.
5. **CORS & HTTP Headers:** Configured via `cors` (restricting allowed origins) and `helmet` for defense against clickjacking, MIME sniffing, and XSS.
6. **Scraper Safety:** Web scraping functions must respect `robots.txt`, utilize standard User-Agent headers, enforce backoff timers, and never bypass paywalls or authentication gates.

---

## 15. Coding Conventions
- **TypeScript Strictness:** Enable strict type checking. Avoid `any` types; define explicit interfaces in `types/`.
- **Component Design:** Modular, reusable UI components placed in `components/ui/` with clear property contracts.
- **Naming Conventions:**
  - Files and directories: `kebab-case` or `camelCase` for utilities; `PascalCase` for React components.
  - Endpoints: RESTful plural nouns (`/api/applications`, `/api/saved-jobs`).
- **Error Handling:** Standardized error response envelope:
  ```json
  {
    "success": false,
    "error": "Meaningful error message",
    "details": null
  }
  ```
- **Async Pattern:** Clean `async/await` with `try...catch` blocks or Express async error wrappers.

---

## 16. Folder Structure
```text
internship-job-tracker/
│
├── AGENTS.md                                # Master development guide & source of truth
├── README.md                                # Setup instructions & developer documentation
│
├── frontend/                                # Next.js App Router Frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx               # Login page
│   │   │   └── register/page.tsx            # Registration page
│   │   ├── applications/
│   │   │   ├── page.tsx                     # Applications list, filters, sort
│   │   │   ├── new/page.tsx                 # Create application
│   │   │   ├── [id]/page.tsx                # Application detail
│   │   │   └── [id]/edit/page.tsx           # Edit application
│   │   ├── jobs/
│   │   │   ├── page.tsx                     # Job search & exploration
│   │   │   └── [id]/page.tsx                # Job details view
│   │   ├── saved-jobs/page.tsx              # User's bookmarked jobs
│   │   ├── cv/
│   │   │   ├── page.tsx                     # Structured CV Builder
│   │   │   └── preview/page.tsx             # Live CV preview & PDF export
│   │   ├── reminders/page.tsx               # Reminders board & manager
│   │   ├── notifications/page.tsx           # Notification center
│   │   ├── settings/page.tsx                # Notification & search settings
│   │   ├── account/page.tsx                 # Account profile
│   │   ├── layout.tsx                       # Root layout (sidebar/nav/auth context)
│   │   ├── page.tsx                         # Dashboard
│   │   └── globals.css                      # Tailwind styles
│   ├── components/
│   │   ├── ui/                              # Base components (Button, Modal, Card, Badge, Input)
│   │   ├── navigation/                      # Sidebar, Navbar, MobileNav
│   │   ├── dashboard/                       # StatsCards, RecentActivity, QuickActions
│   │   ├── applications/                    # ApplicationTable, FilterBar, ConfirmDeleteModal
│   │   ├── jobs/                            # JobCard, JobFilter
│   │   └── cv/                              # CVEducation, CVExperience, CVSkills, CVPreview
│   ├── context/
│   │   └── AuthContext.tsx                  # Global user session & auth state
│   ├── lib/
│   │   ├── api.ts                           # Typed fetch client
│   │   └── utils.ts                         # Date formatting, class utility
│   ├── types/                               # TypeScript interface definitions
│   ├── public/                              # Static assets
│   ├── .env.local                           # Frontend environment variables
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                                 # Express.js REST API Backend
│   ├── prisma/
│   │   ├── schema.prisma                    # Database schema definitions
│   │   └── migrations/                      # Database migration scripts
│   ├── src/
│   │   ├── controllers/                     # Request controllers
│   │   ├── routes/                          # API route definitions
│   │   ├── middleware/                      # Auth guard, validation, error handler
│   │   ├── services/                        # Business logic & 3rd party adapters
│   │   │   ├── scraper.service.ts           # Public job board scraper
│   │   │   ├── jobApi.service.ts            # External job API aggregator
│   │   │   ├── email.service.ts             # Transactional email adapter
│   │   │   ├── sms.service.ts               # SMS dispatch adapter
│   │   │   └── cron.service.ts              # Automated reminder & alert scheduler
│   │   ├── utils/                           # Token, hashing, and prisma client singleton
│   │   └── server.ts                        # Express server entry point
│   ├── tests/                               # Jest / Supertest integration tests
│   ├── .env                                 # Backend environment variables
│   ├── tsconfig.json
│   └── package.json
```

---

## 17. Development Rules
1. Never commit `.env` or sensitive API keys.
2. Never store passwords without bcrypt hashing.
3. Enforce user data isolation on every single backend route.
4. Ensure all user actions have loading states, empty states, and descriptive error messages.
5. Provide accessible, keyboard-navigable dialogs for destructive actions (e.g. deleting an application).
6. Respect all target website terms, robot directives, and rate limits in scraper services.
7. Keep all integrations modular with fallback loggers for missing credentials.

---

## 18. Testing Requirements
- **Backend API Tests:** Jest + Supertest validating:
  - User registration and login flows.
  - JWT token validation and route authorization guards.
  - CRUD operations on applications and verification of user isolation (User A cannot access User B's applications).
  - Accurate calculation of dashboard metrics.
- **Frontend Type & Build Verification:** `tsc --noEmit` and `next build` to guarantee type safety and zero compilation errors.

---

## 19. Deployment Approach
- **Frontend Deployment (Vercel):**
  - Continuous deployment configured on `frontend/` directory.
  - Environment variable: `NEXT_PUBLIC_API_URL` pointing to backend production domain.
- **Backend Deployment (Render / Railway / Container PaaS):**
  - Node.js environment executing `npm run build` and `npm start`.
  - Environment variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.
- **Database (Neon PostgreSQL):**
  - Serverless PostgreSQL with pooling enabled.
  - Prisma migrations applied via `npx prisma migrate deploy` or `prisma db push`.
