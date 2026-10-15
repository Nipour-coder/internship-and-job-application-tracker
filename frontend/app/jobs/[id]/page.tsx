"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  PlusCircle,
  Briefcase,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<any | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobRes, savedRes] = await Promise.allSettled([
        apiRequest<{ success: boolean; job: any }>(`/jobs/${id}`),
        apiRequest<{ success: boolean; savedJobs: any[] }>("/saved-jobs"),
      ]);

      if (jobRes.status === "fulfilled" && jobRes.value?.job) {
        setJob(jobRes.value.job);
      } else {
        setError("Job listing not found or is no longer available.");
      }

      if (savedRes.status === "fulfilled" && savedRes.value?.savedJobs) {
        const hasIt = savedRes.value.savedJobs.some(
          (s: any) => s.jobId === id || s.id === id
        );
        setIsSaved(hasIt);
      }
    } catch (err: any) {
      setError("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!job) return;
    try {
      if (isSaved) {
        await apiRequest(`/saved-jobs/${job.id}`, { method: "DELETE" });
        setIsSaved(false);
      } else {
        await apiRequest("/saved-jobs", {
          method: "POST",
          body: JSON.stringify({ jobId: job.id }),
        });
        setIsSaved(true);
      }
    } catch (err: any) {
      alert("Please log in to save jobs: " + err.message);
    }
  };

  const handleAddToApplications = async () => {
    if (!job) return;
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
          notes: `Added from South Africa live listings (${job.source}). Closing Date: ${
            job.closingDate ? new Date(job.closingDate).toLocaleDateString() : "Open"
          }`,
        }),
      });
      alert(`Added "${job.title}" at ${job.company} to your Application Tracker!`);
      router.push("/applications");
    } catch (err: any) {
      alert("Failed to track job: " + err.message);
    }
  };

  const getDaysRemaining = (closingDateStr: string | null) => {
    if (!closingDateStr) return null;
    const diffTime = new Date(closingDateStr).getTime() - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <LoadingSkeleton message="Loading job details..." count={3} />;
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-4 h-4" /> Back to job search
        </Link>
        <Card className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-charcoal-100 mb-1">Job Not Found or Application Closed</h2>
          <p className="text-sm text-charcoal-400 max-w-md mx-auto">
            {error || "This job listing is no longer active or the application deadline has passed."}
          </p>
          <div className="mt-6">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Browse Active South African Jobs
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const daysRemaining = job.closingDate ? getDaysRemaining(job.closingDate) : null;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-charcoal-400 hover:text-charcoal-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to South African Jobs
        </Link>
        <div className="flex items-center gap-2.5">
          <Button
            variant={isSaved ? "secondary" : "outline"}
            size="sm"
            icon={
              isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-purple-400 fill-purple-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )
            }
            onClick={handleToggleSave}
          >
            {isSaved ? "Saved in Bookmarks" : "Save Job"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<PlusCircle className="w-4 h-4 text-indigo-400" />}
            onClick={handleAddToApplications}
          >
            Track in Pipeline
          </Button>

          {job.applicationUrl && !isExpired && (
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-xs"
            >
              Apply on Employer Site <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Main Job Card */}
      <Card>
        {/* Header Block */}
        <div className="pb-6 border-b border-charcoal-700/60">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-charcoal-100">{job.title}</h1>
                <Badge status={job.jobType} />
              </div>

              <div className="flex items-center gap-2 text-charcoal-200">
                <Building className="w-4 h-4 text-charcoal-400" />
                <span className="text-lg font-semibold">{job.company}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-400 pt-1">
                <span className="flex items-center gap-1 font-medium bg-charcoal-800 text-charcoal-200 px-2.5 py-1 rounded border border-charcoal-700">
                  <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                  {job.location || "South Africa"}
                </span>

                {job.isRemote ? (
                  <span className="text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                    Remote Eligible (ZA)
                  </span>
                ) : (
                  <span className="text-charcoal-300 bg-charcoal-800 border border-charcoal-700 px-2.5 py-1 rounded font-medium">
                    On-site / Hybrid (ZA)
                  </span>
                )}

                <span className="text-charcoal-400 bg-charcoal-800 px-2.5 py-1 rounded border border-charcoal-700">
                  Source: <strong className="text-charcoal-200 font-medium">{job.source}</strong>
                </span>
              </div>
            </div>

            {/* Prominent Apply Button at top right */}
            {job.applicationUrl && (
              <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-lg text-sm shadow-sm transition-all hover:shadow-md"
                >
                  Apply on Employer Site <ExternalLink className="w-4 h-4" />
                </a>
                <span className="text-xs text-charcoal-500">
                  Opens directly in company portal
                </span>
              </div>
            )}
          </div>

          {/* Deadline / Closing Status Banner */}
          <div className="mt-5">
            {job.closingDate ? (
              isExpired ? (
                <div className="flex items-center gap-2 bg-rose-500/10 text-rose-300 px-4 py-3 rounded-lg text-xs font-semibold border border-rose-500/30">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>The application deadline for this position passed on {new Date(job.closingDate).toLocaleDateString()}.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-2 bg-amber-500/10 text-amber-200 px-4 py-3 rounded-lg text-xs font-medium border border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Application Deadline:{" "}
                      <strong className="font-bold text-amber-100">
                        {new Date(job.closingDate).toLocaleDateString("en-ZA", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </strong>
                    </span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-200 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                    {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                  </span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-300 px-4 py-2.5 rounded-lg text-xs font-medium border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Applications are currently open for this position in South Africa. Apply early before slots fill.</span>
              </div>
            )}
          </div>
        </div>

        {/* Job Details / Description */}
        <div className="py-6 space-y-6 border-b border-charcoal-700/60">
          <div>
            <h2 className="text-base font-bold text-charcoal-100 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" /> Job Description
            </h2>
            <div className="text-sm text-charcoal-200 leading-relaxed whitespace-pre-line bg-charcoal-900/60 p-4 rounded-xl border border-charcoal-700/80">
              {job.description || "No full description provided. Please see the original job posting for full specifications."}
            </div>
          </div>

          {job.requirements && (
            <div>
              <h2 className="text-base font-bold text-charcoal-100 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Requirements & Qualifications
              </h2>
              <div className="text-sm text-charcoal-200 leading-relaxed whitespace-pre-line bg-charcoal-900/60 p-4 rounded-xl border border-charcoal-700/80">
                {job.requirements}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-charcoal-500">
            Listed on {new Date(job.createdAt).toLocaleDateString("en-ZA")}
          </p>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={
                isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-purple-400 fill-purple-400" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )
              }
              onClick={handleToggleSave}
            >
              {isSaved ? "Saved" : "Save for Later"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<PlusCircle className="w-4 h-4 text-indigo-400" />}
              onClick={handleAddToApplications}
            >
              Add to Applications
            </Button>

            {job.applicationUrl && !isExpired && (
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-xs transition-colors"
              >
                Apply on Employer Site <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
