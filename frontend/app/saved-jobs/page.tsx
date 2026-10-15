"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Trash2,
  PlusCircle,
  ExternalLink,
  MapPin,
  Briefcase,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function SavedJobsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchSavedJobs();
    }
  }, [user, authLoading]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest<{ success: boolean; savedJobs: any[] }>("/saved-jobs");
      if (res.success && res.savedJobs) {
        setSavedJobs(res.savedJobs);
      }
    } catch (err: any) {
      setError("Failed to load your saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest(`/saved-jobs/${id}`, { method: "DELETE" });
      setSavedJobs(savedJobs.filter((item) => item.id !== id && item.jobId !== id));
    } catch (err: any) {
      alert("Failed to remove saved job: " + err.message);
    }
  };

  const handleConvert = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiRequest<{ success: boolean; application: any }>(
        `/saved-jobs/${id}/convert`,
        { method: "POST" }
      );
      if (res.success) {
        alert("Converted to application successfully!");
        router.push("/applications");
      }
    } catch (err: any) {
      alert("Failed to convert job: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charcoal-700/60">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">Saved Jobs</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            Bookmark interesting positions and convert them directly into applications when ready.
          </p>
        </div>
        <Link href="/jobs">
          <Button variant="outline" icon={<Search className="w-4 h-4" />}>
            Explore More Jobs
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton message="Loading saved jobs..." count={4} />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="You haven't saved any jobs yet."
          description="Browse our job board to bookmark roles you're interested in applying for later."
          actionText="Search Jobs"
          onAction={() => router.push("/jobs")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((item) => {
            const job = item.job || {};

            return (
              <Card
                key={item.id}
                onClick={() => router.push(`/jobs/${job.id || item.jobId}`)}
                className="flex flex-col justify-between hover:border-indigo-500/50 cursor-pointer shadow-xs hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-base text-charcoal-100 group-hover:text-indigo-400 transition-colors">
                        {job.title || "Job Listing"}
                      </h3>
                      <p className="text-sm font-medium text-charcoal-300 mt-0.5">
                        {job.company || "Company"}
                      </p>
                    </div>
                    {job.jobType && <Badge status={job.jobType} />}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-charcoal-400 my-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-charcoal-500" />
                      {job.location || "Remote"}
                    </span>
                    {job.isRemote && (
                      <span className="text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Remote
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-charcoal-300 line-clamp-2 leading-relaxed">
                    {job.description || "No preview description available."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-charcoal-700/60">
                  <span className="text-xs text-indigo-400 font-medium hover:underline">
                    View listing →
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleRemove(item.id, e)}
                      className="p-1.5 text-charcoal-400 hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors"
                      title="Remove saved bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<PlusCircle className="w-3.5 h-3.5" />}
                      onClick={(e) => handleConvert(item.id, e)}
                    >
                      Convert to Application
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
