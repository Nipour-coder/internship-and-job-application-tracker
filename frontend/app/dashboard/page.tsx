"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  ArrowRight,
  Bookmark,
  BellRing,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface DashboardStats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [pendingReminders, setPendingReminders] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, appsRes, savedRes, jobsRes, remindersRes, notifsRes] =
        await Promise.allSettled([
          apiRequest<{ success: boolean; stats: DashboardStats }>("/applications/stats"),
          apiRequest<{ success: boolean; applications: any[] }>("/applications?sort=newest"),
          apiRequest<{ success: boolean; savedJobs: any[] }>("/saved-jobs"),
          apiRequest<{ success: boolean; jobs: any[] }>("/jobs"),
          apiRequest<{ success: boolean; reminders: any[] }>("/reminders"),
          apiRequest<{ success: boolean; notifications: any[] }>("/notifications"),
        ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.stats) {
        setStats(statsRes.value.stats);
      }
      if (appsRes.status === "fulfilled" && appsRes.value?.applications) {
        const apps = appsRes.value.applications;
        setRecentApplications(apps.slice(0, 4));
        setUpcomingInterviews(apps.filter((a) => a.status === "INTERVIEW").slice(0, 3));
      }
      if (savedRes.status === "fulfilled" && savedRes.value?.savedJobs) {
        setSavedJobs(savedRes.value.savedJobs.slice(0, 3));
      }
      if (jobsRes.status === "fulfilled" && jobsRes.value?.jobs) {
        setRecentJobs(jobsRes.value.jobs.slice(0, 3));
      }
      if (remindersRes.status === "fulfilled" && remindersRes.value?.reminders) {
        setPendingReminders(
          remindersRes.value.reminders.filter((r) => !r.isCompleted).slice(0, 3)
        );
      }
      if (notifsRes.status === "fulfilled" && notifsRes.value?.notifications) {
        setRecentNotifications(notifsRes.value.notifications.slice(0, 3));
      }
    } catch (err: any) {
      setError("Something went wrong while loading your dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && !recentApplications.length)) {
    return <LoadingSkeleton message="Loading dashboard..." count={4} />;
  }

  return (
    <div className="space-y-8 text-charcoal-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-charcoal-700">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">
            Welcome back, {user?.fullName?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-sm text-charcoal-400 mt-1">
            Here is what is happening with your internship & job search today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/applications/new">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Application
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline" icon={<Sparkles className="w-4 h-4" />}>
              Explore Jobs
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="flex flex-col justify-between border-charcoal-700 bg-charcoal-850">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-charcoal-100">{stats.total}</div>
          <p className="text-xs text-charcoal-400 mt-1">Applications logged</p>
        </Card>

        <Card className="flex flex-col justify-between border-blue-900/60 bg-blue-950/20">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Applied</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300">{stats.applied}</div>
          <p className="text-xs text-blue-400/70 mt-1">Awaiting response</p>
        </Card>

        <Card className="flex flex-col justify-between border-amber-900/60 bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Interviews</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{stats.interview}</div>
          <p className="text-xs text-amber-400/70 mt-1">Active interview stages</p>
        </Card>

        <Card className="flex flex-col justify-between border-emerald-900/60 bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Offers</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">{stats.offer}</div>
          <p className="text-xs text-emerald-400/70 mt-1">Offers received</p>
        </Card>

        <Card className="flex flex-col justify-between border-rose-900/60 bg-rose-950/20">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300">{stats.rejected}</div>
          <p className="text-xs text-rose-400/70 mt-1">Closed applications</p>
        </Card>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applications */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-charcoal-100">Recent Applications</h2>
              <Link
                href="/applications"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="You don't have any applications yet."
                description="Keep track of every internship and job you apply for in one place."
                actionText="Add Application"
                onAction={() => router.push("/applications/new")}
              />
            ) : (
              <div className="divide-y divide-charcoal-750">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => router.push(`/applications/${app.id}`)}
                    className="py-3 flex items-center justify-between hover:bg-charcoal-800/70 rounded-lg px-2.5 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-charcoal-100">{app.position}</p>
                      <p className="text-xs text-charcoal-400">
                        {app.company} {app.location ? `• ${app.location}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-charcoal-500">
                        {new Date(app.dateApplied).toLocaleDateString()}
                      </span>
                      <Badge status={app.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Job Opportunities */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-charcoal-100">Recent Job Opportunities</h2>
              <Link
                href="/jobs"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Search all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className="p-3.5 rounded-lg border border-charcoal-700 hover:border-indigo-500/40 hover:bg-charcoal-800/60 cursor-pointer transition-all flex items-start justify-between gap-3"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-charcoal-100">{job.title}</h3>
                    <p className="text-xs text-charcoal-400 mt-0.5">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  <Badge status={job.jobType} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col wide) */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-charcoal-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> Upcoming Interviews
              </h2>
            </div>
            {upcomingInterviews.length === 0 ? (
              <p className="text-xs text-charcoal-400 py-3 text-center">No upcoming interviews recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingInterviews.map((item) => (
                  <div key={item.id} className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs">
                    <p className="font-semibold text-charcoal-100">{item.company}</p>
                    <p className="text-charcoal-300">{item.position}</p>
                    {item.notes && <p className="text-amber-300/80 mt-1 italic">&ldquo;{item.notes}&rdquo;</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Reminders */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-charcoal-100 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-indigo-400" /> Pending Reminders
              </h2>
              <Link href="/reminders" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                Manage
              </Link>
            </div>
            {pendingReminders.length === 0 ? (
              <p className="text-xs text-charcoal-400 py-3 text-center">You don&apos;t have any upcoming reminders.</p>
            ) : (
              <div className="space-y-2">
                {pendingReminders.map((rem) => (
                  <div key={rem.id} className="p-2.5 bg-charcoal-800/60 border border-charcoal-700 rounded-lg text-xs">
                    <p className="font-medium text-charcoal-100">{rem.title}</p>
                    <p className="text-charcoal-400 mt-0.5">Due: {new Date(rem.dueDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Saved Jobs */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-charcoal-100 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-400" /> Saved Jobs
              </h2>
              <Link href="/saved-jobs" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                View all ({savedJobs.length})
              </Link>
            </div>
            {savedJobs.length === 0 ? (
              <p className="text-xs text-charcoal-400 py-3 text-center">You haven&apos;t saved any jobs yet.</p>
            ) : (
              <div className="space-y-2">
                {savedJobs.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/jobs/${item.job?.id || item.jobId}`)}
                    className="p-2.5 rounded-lg border border-charcoal-700 hover:bg-charcoal-800 cursor-pointer text-xs transition-colors"
                  >
                    <p className="font-medium text-charcoal-100 truncate">{item.job?.title || "Saved Listing"}</p>
                    <p className="text-charcoal-400">{item.job?.company}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
