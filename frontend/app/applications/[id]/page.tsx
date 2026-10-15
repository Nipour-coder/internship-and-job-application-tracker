"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  DollarSign,
  ExternalLink,
  Edit,
  Trash2,
  BellPlus,
  Clock,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [application, setApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick reminder modal
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest<{ success: boolean; application: any }>(
        `/applications/${id}`
      );
      if (res.success && res.application) {
        setApplication(res.application);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!application) return;
    try {
      const res = await apiRequest(`/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setApplication({ ...application, status: newStatus });
      }
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiRequest(`/applications/${id}`, { method: "DELETE" });
      router.push("/applications");
    } catch (err: any) {
      alert("Failed to delete application: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle || !reminderDate) return;
    try {
      setIsSavingReminder(true);
      await apiRequest("/reminders", {
        method: "POST",
        body: JSON.stringify({
          title: reminderTitle,
          dueDate: reminderDate,
          applicationId: id,
          reminderType: "FOLLOW_UP",
        }),
      });
      setReminderModalOpen(false);
      setReminderTitle("");
      setReminderDate("");
      alert("Reminder scheduled!");
    } catch (err: any) {
      alert("Failed to create reminder: " + err.message);
    } finally {
      setIsSavingReminder(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton message="Loading application..." count={2} />;
  }

  if (error || !application) {
    return (
      <div className="space-y-4">
        <Link href="/applications" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </Link>
        <Card className="text-center py-10">
          <p className="text-charcoal-400">{error || "Application not found."}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm font-medium text-charcoal-400 hover:text-charcoal-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<BellPlus className="w-4 h-4" />}
            onClick={() => setReminderModalOpen(true)}
          >
            Add Reminder
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => router.push(`/applications/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Details Card */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 border-b border-charcoal-700/60">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-charcoal-100">{application.position}</h1>
              <Badge status={application.status} />
            </div>
            <p className="text-lg text-charcoal-300 font-medium mt-1">{application.company}</p>
          </div>

          {/* Quick Status Selector */}
          <div className="flex items-center gap-2 bg-charcoal-900/60 p-1.5 rounded-lg border border-charcoal-700">
            <span className="text-xs font-semibold text-charcoal-400 pl-2">Stage:</span>
            {["APPLIED", "INTERVIEW", "OFFER", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  application.status === st
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-charcoal-300 hover:text-charcoal-100 hover:bg-charcoal-800"
                }`}
              >
                {st === "APPLIED"
                  ? "Applied"
                  : st === "INTERVIEW"
                  ? "Interview"
                  : st === "OFFER"
                  ? "Offer"
                  : "Rejected"}
              </button>
            ))}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-charcoal-700/60 text-sm">
          <div className="flex items-center gap-3 text-charcoal-300">
            <Calendar className="w-4 h-4 text-charcoal-500" />
            <div>
              <p className="text-xs text-charcoal-400">Date Applied</p>
              <p className="font-medium text-charcoal-100">
                {new Date(application.dateApplied).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-charcoal-300">
            <MapPin className="w-4 h-4 text-charcoal-500" />
            <div>
              <p className="text-xs text-charcoal-400">Location</p>
              <p className="font-medium text-charcoal-100">
                {application.location || "Not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-charcoal-300">
            <DollarSign className="w-4 h-4 text-charcoal-500" />
            <div>
              <p className="text-xs text-charcoal-400">Compensation</p>
              <p className="font-medium text-charcoal-100">
                {application.salary || "Not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-charcoal-300">
            <ExternalLink className="w-4 h-4 text-charcoal-500" />
            <div>
              <p className="text-xs text-charcoal-400">Job URL</p>
              {application.jobUrl ? (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline truncate block max-w-[150px]"
                >
                  View Listing
                </a>
              ) : (
                <p className="text-charcoal-500">None attached</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="pt-6">
          <h2 className="text-base font-semibold text-charcoal-100 mb-2">Notes & Interview Details</h2>
          {application.notes ? (
            <div className="p-4 bg-charcoal-900/60 rounded-xl border border-charcoal-700/80 text-charcoal-200 whitespace-pre-wrap text-sm leading-relaxed">
              {application.notes}
            </div>
          ) : (
            <p className="text-sm text-charcoal-500 italic">
              No notes logged for this application yet. Click Edit to add interview rounds, recruiter notes, or interview prep.
            </p>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal (Requirement 16) */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Application"
        message="Are you sure you want to delete this application?"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />

      {/* Add Reminder Modal */}
      <Modal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        title="Schedule Reminder"
      >
        <form onSubmit={handleAddReminder} className="space-y-4">
          <Input
            label="Reminder Title"
            placeholder="e.g. Follow up on technical round"
            value={reminderTitle}
            onChange={(e) => setReminderTitle(e.target.value)}
            required
          />
          <Input
            label="Due Date & Time"
            type="datetime-local"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReminderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSavingReminder}>
              Save Reminder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
