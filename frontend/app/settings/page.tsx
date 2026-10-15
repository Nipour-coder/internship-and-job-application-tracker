"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Mail,
  Smartphone,
  Save,
  Check,
  Search,
  CheckCircle,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [applicationReminders, setApplicationReminders] = useState(true);
  const [statusChangeNotifications, setStatusChangeNotifications] = useState(true);

  // Job Search Preferences
  const [keywords, setKeywords] = useState("");
  const [desiredRoles, setDesiredRoles] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("INTERNSHIP");
  const [isRemote, setIsRemote] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [isSavingJobPrefs, setIsSavingJobPrefs] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [jobPrefSaved, setJobPrefSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchSettings();
    }
  }, [user, authLoading]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [notifsRes, jobsRes] = await Promise.allSettled([
        apiRequest<{ success: boolean; preferences: any }>("/settings/notifications"),
        apiRequest<{ success: boolean; preferences: any }>("/settings/job-preferences"),
      ]);

      if (notifsRes.status === "fulfilled" && notifsRes.value?.preferences) {
        const p = notifsRes.value.preferences;
        setEmailNotifications(p.emailNotifications ?? true);
        setSmsNotifications(p.smsNotifications ?? false);
        setJobAlerts(p.jobAlerts ?? true);
        setInterviewReminders(p.interviewReminders ?? true);
        setApplicationReminders(p.applicationReminders ?? true);
        setStatusChangeNotifications(p.statusChangeNotifications ?? true);
      }

      if (jobsRes.status === "fulfilled" && jobsRes.value?.preferences) {
        const j = jobsRes.value.preferences;
        setKeywords(j.keywords || "");
        setDesiredRoles(j.desiredRoles || "");
        setLocation(j.location || "");
        setJobType(j.jobType || "INTERNSHIP");
        setIsRemote(j.isRemote ?? false);
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingNotifs(true);
      setNotifSaved(false);
      await apiRequest("/settings/notifications", {
        method: "PUT",
        body: JSON.stringify({
          emailNotifications,
          smsNotifications,
          jobAlerts,
          interviewReminders,
          applicationReminders,
          statusChangeNotifications,
        }),
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 3000);
    } catch (err: any) {
      alert("Failed to update notification settings: " + err.message);
    } finally {
      setIsSavingNotifs(false);
    }
  };

  const handleSaveJobPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingJobPrefs(true);
      setJobPrefSaved(false);
      await apiRequest("/settings/job-preferences", {
        method: "PUT",
        body: JSON.stringify({
          keywords,
          desiredRoles,
          location,
          jobType,
          isRemote,
        }),
      });
      setJobPrefSaved(true);
      setTimeout(() => setJobPrefSaved(false), 3000);
    } catch (err: any) {
      alert("Failed to update job preferences: " + err.message);
    } finally {
      setIsSavingJobPrefs(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton message="Loading settings..." count={3} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">Settings & Preferences</h1>
        <p className="text-sm text-charcoal-400 mt-1">
          Customize alert channels and configure automated background job matching.
        </p>
      </div>

      {/* 1. Notification Channels & Alerts */}
      <Card>
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-charcoal-700/60">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-charcoal-100">Notification Settings</h2>
        </div>

        <form onSubmit={handleSaveNotifications} className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
              Delivery Channels
            </h3>

            <label className="flex items-center justify-between p-3 rounded-lg border border-charcoal-700 bg-charcoal-900/60 hover:bg-charcoal-800 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-charcoal-400" />
                <div>
                  <p className="text-sm font-medium text-charcoal-200">Email Notifications</p>
                  <p className="text-xs text-charcoal-400">
                    Receive important status updates, deadlines, and digests via email.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-charcoal-600 bg-charcoal-950"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-charcoal-700 bg-charcoal-900/60 hover:bg-charcoal-800 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-charcoal-400" />
                <div>
                  <p className="text-sm font-medium text-charcoal-200">SMS Alerts</p>
                  <p className="text-xs text-charcoal-400">
                    Receive urgent interview alerts and critical deadline reminders via SMS.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-charcoal-600 bg-charcoal-950"
              />
            </label>
          </div>

          <div className="space-y-3 pt-3 border-t border-charcoal-700/60">
            <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
              Alert Triggers
            </h3>

            <div className="space-y-2 text-sm text-charcoal-300">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusChangeNotifications}
                  onChange={(e) => setStatusChangeNotifications(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-charcoal-600 bg-charcoal-950 h-4 w-4"
                />
                Application status changes (e.g. Applied → Interview)
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={interviewReminders}
                  onChange={(e) => setInterviewReminders(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-charcoal-600 bg-charcoal-950 h-4 w-4"
                />
                Upcoming interview reminders (24 hours prior)
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applicationReminders}
                  onChange={(e) => setApplicationReminders(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-charcoal-600 bg-charcoal-950 h-4 w-4"
                />
                Follow-up reminders (after 14 days of no update)
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={jobAlerts}
                  onChange={(e) => setJobAlerts(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-charcoal-600 bg-charcoal-950 h-4 w-4"
                />
                Matching job opportunities digest
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end pt-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={notifSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              isLoading={isSavingNotifs}
            >
              {notifSaved ? "Saved!" : "Save Notification Preferences"}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Automated Job Search Preferences */}
      <Card>
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-charcoal-700/60">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-charcoal-100">Job Search Preferences</h2>
        </div>
        <p className="text-xs text-charcoal-400 mb-4">
          Configure default search parameters used by automated scrapers and search tools.
        </p>

        <form onSubmit={handleSaveJobPreferences} className="space-y-4">
          <Input
            label="Target Keywords"
            placeholder="e.g. Software Engineer, React, Frontend, Data Science"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />

          <Input
            label="Desired Job Titles"
            placeholder="e.g. Summer Intern 2025, Junior Software Engineer"
            value={desiredRoles}
            onChange={(e) => setDesiredRoles(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preferred Location"
              placeholder="e.g. Johannesburg, Cape Town, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Select
              label="Opportunity Type"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              options={[
                { value: "INTERNSHIP", label: "Internship" },
                { value: "GRADUATE", label: "Graduate Programme" },
                { value: "ENTRY_LEVEL", label: "Entry Level" },
                { value: "JUNIOR", label: "Junior" },
              ]}
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-charcoal-300">
            <input
              type="checkbox"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 border-charcoal-600 bg-charcoal-950 h-4 w-4"
            />
            Prioritize Remote / Work-From-Home roles
          </label>

          <div className="flex items-center justify-end pt-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={jobPrefSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              isLoading={isSavingJobPrefs}
            >
              {jobPrefSaved ? "Saved!" : "Save Job Preferences"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
