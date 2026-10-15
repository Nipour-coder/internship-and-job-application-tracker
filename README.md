# Internship & Job Application Tracker

A modern, full-stack web platform designed to help students, recent graduates, and entry-level job seekers manage their internship and job application journey in one organized place.

---

## Features
- **Application Tracker:** Add, edit, delete, and manage applications across states (`Applied`, `Interview`, `Offer`, `Rejected`).
- **Real-Time Dashboard:** Clear statistics, upcoming interviews, pending reminders, and recent opportunities.
- **Job Search & Aggregation:** Explore opportunities with live scraping and external API integration.
- **Saved Jobs:** Bookmark listings and convert them directly into tracked applications.
- **Resume / CV Builder:** Structured multi-section CV builder with live preview and PDF download.
- **Status Reminders & Notifications:** Background alerts for follow-ups, interviews, and deadlines.
- **Strict Data Isolation:** Multi-tenant architecture ensuring user privacy at the database level.
- **Responsive Web App:** Seamless experience on desktop, tablet, and mobile browsers.

---

## Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express.js, TypeScript, REST API
- **Database:** PostgreSQL (Neon PostgreSQL) via Prisma ORM
- **Authentication:** JWT with bcryptjs password hashing and OAuth readiness

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (or Neon PostgreSQL account)

### Quick Start

1. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update DATABASE_URL in .env
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

Run the backend and frontend in separate terminals. The backend API must be available at
`http://localhost:5000` while using the default local frontend configuration. If account
registration or sign-in reports that it cannot connect to the API, start the backend and check
`frontend/.env.local`.

### Deployment configuration

Set `NEXT_PUBLIC_API_URL` in the frontend deployment environment to the deployed backend URL
including `/api` (for example, `https://your-api.example.com/api`). Set the backend's `CLIENT_URL`
to the frontend's exact origin so CORS permits browser requests, and set a private `JWT_SECRET` of
at least 32 characters. In production, the frontend does not silently fall back to `localhost`
when `NEXT_PUBLIC_API_URL` is missing.

#### Deploy the backend to Render

The repository-root `render.yaml` defines the backend web service. Push the repository to GitHub,
then in Render choose **New + → Blueprint**, connect the repository, and apply the blueprint.
Render builds from `backend/`, generates the Prisma client, builds the TypeScript API, and checks
`/api/health`. Render provides the listening port automatically.

When prompted, configure:

- `DATABASE_URL`: the Neon connection string for the intended database and branch. Keep it private.
- `CLIENT_URL`: the frontend's exact deployed origin (for example, `https://your-app.vercel.app`).
- `SERVER_URL`: the Render service's public origin (for example, `https://internship-tracker-api.onrender.com`).

Render generates `JWT_SECRET` automatically. If the frontend URL or Render service URL is not yet
available during setup, update `CLIENT_URL` and `SERVER_URL` in the Render service's environment
settings after deployment. Once the service is live, verify
`https://<your-render-service>.onrender.com/api/health`, then set the frontend's
`NEXT_PUBLIC_API_URL` to `https://<your-render-service>.onrender.com/api` and redeploy the frontend.
The Neon schema must be initialized separately with `npx prisma db push` from `backend/`; do not
run schema-push commands automatically on every production deploy.

Google and GitHub sign-in require provider credentials in the backend environment
(`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`).
Set `SERVER_URL` to the public backend origin (for example, `https://your-api.example.com`).
Register these callback URLs in each provider's OAuth application:

- Google: `${SERVER_URL}/api/auth/callback/google`
- GitHub: `${SERVER_URL}/api/auth/callback/github`

The callback validates a short-lived state cookie, exchanges the provider code server-side, and
requires a verified email address. Until credentials and callback URLs are configured, use email
and password sign-in.
