"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchApplications();
    }
  }, [user, authLoading, statusFilter, sortBy, searchQuery]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (sortBy) params.append("sort", sortBy);
      if (searchQuery) params.append("search", searchQuery);

      const res = await apiRequest<{ success: boolean; applications: any[] }>(
        `/applications?${params.toString()}`
      );

      if (res.success && res.applications) {
        setApplications(res.applications);
      }
    } catch (err: any) {
      setError("Something went wrong while loading your applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDelete = (app: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppToDelete(app);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!appToDelete) return;
    try {
      setIsDeleting(true);
      await apiRequest(`/applications/${appToDelete.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setAppToDelete(null);
      fetchApplications();
    } catch (err: any) {
      alert("Failed to delete application: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-charcoal-700">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">Applications</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            Track and manage your applications across each hiring stage.
          </p>
        </div>
        <Link href="/applications/new">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Application
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-charcoal-850 p-3.5 rounded-xl border border-charcoal-700 shadow-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500" />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-charcoal-900 text-charcoal-100 placeholder-charcoal-500 border border-charcoal-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {["ALL", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/50"
                  : "bg-charcoal-750 text-charcoal-300 hover:bg-charcoal-700 border border-charcoal-700"
              }`}
            >
              {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-charcoal-700 rounded-lg px-2.5 py-1.5 bg-charcoal-900 text-charcoal-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="newest" className="bg-charcoal-850">Newest first</option>
            <option value="oldest" className="bg-charcoal-850">Oldest first</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSkeleton message="Loading applications..." type="table" count={5} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="You don't have any applications yet."
          description="Start logging your internships and job opportunities to track your progress."
          actionText="Add Application"
          onAction={() => router.push("/applications/new")}
        />
      ) : (
        <div className="bg-charcoal-850 border border-charcoal-700 rounded-xl overflow-hidden shadow-lg shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal-800 border-b border-charcoal-700 text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Company & Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date Applied</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-750 text-charcoal-300">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => router.push(`/applications/${app.id}`)}
                    className="hover:bg-charcoal-800/70 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-charcoal-100">{app.position}</div>
                      <div className="text-xs text-charcoal-400 flex items-center gap-1.5 mt-0.5">
                        <span>{app.company}</span>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-charcoal-400 whitespace-nowrap">
                      {new Date(app.dateApplied).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-xs text-charcoal-400">
                      {app.location || "Not specified"}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => router.push(`/applications/${app.id}/edit`)}
                          className="p-1.5 text-charcoal-400 hover:text-indigo-400 rounded-md hover:bg-charcoal-750 transition-colors"
                          title="Edit application"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleOpenDelete(app, e)}
                          className="p-1.5 text-charcoal-400 hover:text-rose-400 rounded-md hover:bg-rose-950/40 transition-colors"
                          title="Delete application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Requirement 16) */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Application"
        message="Are you sure you want to delete this application?"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
}
