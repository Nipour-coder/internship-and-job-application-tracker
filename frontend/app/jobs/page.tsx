"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Bookmark,
  BookmarkCheck,
  PlusCircle,
  ExternalLink,
  Briefcase,
  Globe,
  RotateCw,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function JobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("ALL");
  const [remoteOnly, setRemoteOnly] = useState(false);

  useEffect(() => {
    fetchJobsAndSaved();
  }, [jobType, remoteOnly, location]);

  const fetchJobsAndSaved = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (location) params.append("location", location);
      if (jobType !== "ALL") params.append("jobType", jobType);
      if (remoteOnly) params.append("remote", "true");

      const [jobsRes, savedRes] = await Promise.allSettled([
        apiRequest<{ success: boolean; jobs: any[] }>(`/jobs?${params.toString()}`),
        apiRequest<{ success: boolean; savedJobs: any[] }>("/saved-jobs"),
      ]);

      if (jobsRes.status === "fulfilled" && jobsRes.value?.jobs) {
        // Exclude any job whose closing date has passed
        const activeJobs = jobsRes.value.jobs.filter(
          (j: any) => !j.closingDate || new Date(j.closingDate).getTime() >= Date.now()
        );
        setJobs(activeJobs);
      }
      if (savedRes.status === "fulfilled" && savedRes.value?.savedJobs) {
        const ids = new Set<string>(savedRes.value.savedJobs.map((s: any) => s.jobId));
        setSavedJobIds(ids);
      }
    } catch (err: any) {
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSearching(true);
      setError("");

      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (location) params.append("location", location);
      if (jobType !== "ALL") params.append("jobType", jobType);
      if (remoteOnly) params.append("remote", "true");

      const res = await apiRequest<{ success: boolean; jobs: any[] }>(
        `/jobs/search?${params.toString()}`
      );
      if (res.success && res.jobs) {
        // Filter out expired jobs
        const activeJobs = res.jobs.filter(
          (j: any) => !j.closingDate || new Date(j.closingDate).getTime() >= Date.now()
        );
        setJobs(activeJobs);
      }
    } catch (err: any) {
      setError("Failed to fetch fresh job updates.");
    } finally {
      setSearching(false);
    }
  };

  const toggleSaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (savedJobIds.has(jobId)) {
        await apiRequest(`/saved-jobs/${jobId}`, { method: "DELETE" });
        const next = new Set(savedJobIds);
        next.delete(jobId);
        setSavedJobIds(next);
      } else {
        await apiRequest("/saved-jobs", {
          method: "POST",
          body: JSON.stringify({ jobId }),
        });
        const next = new Set(savedJobIds);
        next.add(jobId);
        setSavedJobIds(next);
      }
    } catch (err: any) {
      alert("Please log in to save jobs: " + err.message);
    }
  };

  const handleAddToTracker = async (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest("/applications", {
        method: "POST",
        body: JSON.stringify({
          company: job.company,
          position: job.title,
          location: job.location,
          status: "APPLIED",
          dateApplied: new Date().toISOString(),
          jobUrl: job.applicationUrl,
          notes: `Discovered on job board (${job.source}). Closing Date: ${
            job.closingDate ? new Date(job.closingDate).toLocaleDateString() : "Open"
          }`,
        }),
      });
      alert(`Added "${job.title}" at ${job.company} to your Application Tracker!`);
      router.push("/applications");
    } catch (err: any) {
      alert("Failed to add application: " + err.message);
    }
  };

  const getDaysRemaining = (closingDate: string) => {
    if (!closingDate) return null;
    const diff = new Date(closingDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charcoal-700/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">
              Live Jobs & Internships
            </h1>
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Listings
            </span>
          </div>
          <p className="text-sm text-charcoal-400 mt-1">
            Browse active advertised opportunities in South Africa with live application links.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Search and Filter Form */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-charcoal-850 p-4 rounded-xl border border-charcoal-700/80 shadow-xs space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500" />
            <input
              type="text"
              placeholder="Keyword or Title (e.g. Intern, Software Developer)..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-charcoal-900 border border-charcoal-700 rounded-lg text-charcoal-100 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-charcoal-600"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500" />
            <input
              type="text"
              placeholder="Location (e.g. Johannesburg, Cape Town, Durban)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-charcoal-900 border border-charcoal-700 rounded-lg text-charcoal-100 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-charcoal-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={searching}
              icon={<RotateCw className="w-4 h-4" />}
            >
              Search & Refresh
            </Button>
          </div>
        </div>

        {/* South Africa City Quick-Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="font-semibold text-charcoal-400 mr-1">South Africa Locations:</span>
          {[
            { label: "All SA", val: "" },
            { label: "Johannesburg", val: "Johannesburg" },
            { label: "Cape Town", val: "Cape Town" },
            { label: "Durban", val: "Durban" },
            { label: "Pretoria", val: "Pretoria" },
            { label: "Sandton", val: "Sandton" },
            { label: "Remote (ZA)", val: "Remote" },
          ].map((loc) => (
            <button
              type="button"
              key={loc.label}
              onClick={() => setLocation(loc.val)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                location === loc.val
                  ? "bg-indigo-600 text-white font-medium shadow-xs"
                  : "bg-charcoal-900/80 text-charcoal-300 border border-charcoal-700 hover:bg-charcoal-800 hover:text-charcoal-100"
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>

        {/* Opportunity Type Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-charcoal-700/60 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="font-semibold text-charcoal-400">Category:</span>
            {[
              { id: "ALL", label: "All Types" },
              { id: "INTERNSHIP", label: "Internships" },
              { id: "GRADUATE", label: "Graduate Schemes" },
              { id: "ENTRY_LEVEL", label: "Entry Level" },
              { id: "JUNIOR", label: "Junior Roles" },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setJobType(t.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  jobType === t.id
                    ? "bg-indigo-600 text-white font-semibold"
                    : "bg-charcoal-900/80 text-charcoal-300 border border-charcoal-700 hover:bg-charcoal-800 hover:text-charcoal-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-charcoal-300 font-medium">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded border-charcoal-700 bg-charcoal-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <Globe className="w-3.5 h-3.5 text-charcoal-400" />
            Remote only
          </label>
        </div>
      </form>

      {/* Jobs Catalog */}
      {loading ? (
        <LoadingSkeleton message="Loading active South African opportunities..." count={6} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No active advertised jobs matched your criteria."
          description="Try selecting a different city or clearing your keyword filter."
          actionText="View All South African Jobs"
          onAction={() => {
            setLocation("");
            setKeyword("");
            setJobType("ALL");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const isSaved = savedJobIds.has(job.id);
            const daysRemaining = job.closingDate ? getDaysRemaining(job.closingDate) : null;

            return (
              <Card
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="flex flex-col justify-between hover:border-indigo-500/50 transition-all shadow-xs hover:shadow-lg cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-base text-charcoal-100 group-hover:text-indigo-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm font-semibold text-charcoal-300 mt-0.5">{job.company}</p>
                    </div>
                    <Badge status={job.jobType} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-charcoal-400 my-2.5">
                    <span className="flex items-center gap-1 font-medium text-charcoal-300">
                      <MapPin className="w-3.5 h-3.5 text-charcoal-500" />
                      {job.location}
                    </span>
                    {job.isRemote && (
                      <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Remote
                      </span>
                    )}
                    {job.closingDate && daysRemaining !== null && (
                      <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-medium">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Closing in {daysRemaining} days ({new Date(job.closingDate).toLocaleDateString()})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-charcoal-300 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-charcoal-700/60">
                  {/* Real Live Application Link */}
                  {job.applicationUrl ? (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      Apply Now <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-indigo-400 font-semibold hover:underline">
                      View details →
                    </span>
                  )}

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => toggleSaveJob(job.id, e)}
                      className={`p-2 rounded-lg border transition-colors ${
                        isSaved
                          ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                          : "border-charcoal-700 text-charcoal-400 hover:text-charcoal-100 hover:bg-charcoal-800"
                      }`}
                      title={isSaved ? "Remove from saved" : "Save job"}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 fill-purple-400 text-purple-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={<PlusCircle className="w-3.5 h-3.5" />}
                      onClick={(e) => handleAddToTracker(job, e)}
                    >
                      Track
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
