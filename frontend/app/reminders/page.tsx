"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  Clock,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function RemindersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [reminders, setReminders] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter
  const [filterType, setFilterType] = useState("ALL");

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminderType, setReminderType] = useState("FOLLOW_UP");
  const [applicationId, setApplicationId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchRemindersAndApps();
    }
  }, [user, authLoading]);

  const fetchRemindersAndApps = async () => {
    try {
      setLoading(true);
      setError("");

      const [remRes, appsRes] = await Promise.allSettled([
        apiRequest<{ success: boolean; reminders: any[] }>("/reminders"),
        apiRequest<{ success: boolean; applications: any[] }>("/applications"),
      ]);

      if (remRes.status === "fulfilled" && remRes.value?.reminders) {
        setReminders(remRes.value.reminders);
      }
      if (appsRes.status === "fulfilled" && appsRes.value?.applications) {
        setApplications(appsRes.value.applications);
      }
    } catch (err: any) {
      setError("Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingReminder(null);
    setTitle("");
    setDueDate(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    setReminderType("FOLLOW_UP");
    setApplicationId("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (rem: any) => {
    setEditingReminder(rem);
    setTitle(rem.title);
    setDueDate(
      rem.dueDate
        ? new Date(rem.dueDate).toISOString().slice(0, 16)
        : ""
    );
    setReminderType(rem.reminderType || "FOLLOW_UP");
    setApplicationId(rem.applicationId || "");
    setModalOpen(true);
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    try {
      setIsSaving(true);
      if (editingReminder) {
        await apiRequest(`/reminders/${editingReminder.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title: title.trim(),
            dueDate: new Date(dueDate).toISOString(),
            reminderType,
            applicationId: applicationId || null,
          }),
        });
      } else {
        await apiRequest("/reminders", {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            dueDate: new Date(dueDate).toISOString(),
            reminderType,
            applicationId: applicationId || null,
          }),
        });
      }
      setModalOpen(false);
      fetchRemindersAndApps();
    } catch (err: any) {
      alert("Failed to save reminder: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleComplete = async (rem: any) => {
    try {
      await apiRequest(`/reminders/${rem.id}`, {
        method: "PUT",
        body: JSON.stringify({ isCompleted: !rem.isCompleted }),
      });
      setReminders(
        reminders.map((r) =>
          r.id === rem.id ? { ...r, isCompleted: !r.isCompleted } : r
        )
      );
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleOpenDelete = (rem: any) => {
    setReminderToDelete(rem);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reminderToDelete) return;
    try {
      setIsDeleting(true);
      await apiRequest(`/reminders/${reminderToDelete.id}`, { method: "DELETE" });
      setDeleteModalOpen(false);
      setReminderToDelete(null);
      setReminders(reminders.filter((r) => r.id !== reminderToDelete.id));
    } catch (err: any) {
      alert("Failed to delete reminder: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredReminders = reminders.filter((r) => {
    if (filterType === "ALL") return true;
    return r.reminderType === filterType;
  });

  const pending = filteredReminders.filter((r) => !r.isCompleted);
  const completed = filteredReminders.filter((r) => r.isCompleted);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charcoal-700/60">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">Reminders</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            Automated alerts for application follow-ups, scheduled interviews, and deadlines.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
          Schedule Reminder
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "ALL", label: "All Reminders" },
          { id: "FOLLOW_UP", label: "Follow-ups" },
          { id: "INTERVIEW", label: "Interviews" },
          { id: "DEADLINE", label: "Deadlines" },
          { id: "CUSTOM", label: "Custom" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === t.id
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "bg-charcoal-850 border border-charcoal-700 text-charcoal-300 hover:bg-charcoal-800 hover:text-charcoal-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main List */}
      {loading ? (
        <LoadingSkeleton message="Loading reminders..." count={4} />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="You don't have any reminders yet."
          description="Never miss an application deadline or interview follow-up by setting a reminder."
          actionText="Create a Reminder"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="space-y-6">
          {/* Pending / Active */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider">
              Pending & Upcoming ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <p className="text-xs text-charcoal-400 italic bg-charcoal-850 p-4 rounded-xl border border-charcoal-700">
                No pending reminders in this category.
              </p>
            ) : (
              <div className="space-y-2.5">
                {pending.map((rem) => {
                  const isOverdue = new Date(rem.dueDate).getTime() < Date.now();

                  return (
                    <Card
                      key={rem.id}
                      className={`flex items-center justify-between p-4 ${
                        isOverdue ? "border-amber-500/40 bg-amber-500/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button
                          onClick={() => handleToggleComplete(rem)}
                          className="text-charcoal-400 hover:text-emerald-400 transition-colors"
                          title="Mark complete"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-charcoal-100">{rem.title}</span>
                            <Badge status={rem.reminderType} />
                            {isOverdue && (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                                Due
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-charcoal-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
                              {new Date(rem.dueDate).toLocaleString([], {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                            {rem.application && (
                              <span className="flex items-center gap-1 text-indigo-400">
                                <Briefcase className="w-3.5 h-3.5" />
                                {rem.application.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(rem)}
                          className="p-1.5 text-charcoal-400 hover:text-indigo-400 rounded-md hover:bg-charcoal-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(rem)}
                          className="p-1.5 text-charcoal-400 hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Reminders */}
          {completed.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-charcoal-700/60">
              <h2 className="text-sm font-bold text-charcoal-400 uppercase tracking-wider">
                Completed ({completed.length})
              </h2>
              <div className="space-y-2">
                {completed.map((rem) => (
                  <div
                    key={rem.id}
                    className="flex items-center justify-between p-3.5 bg-charcoal-900/60 border border-charcoal-700/80 rounded-xl text-charcoal-400 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleComplete(rem)}
                        className="text-emerald-400"
                        title="Mark incomplete"
                      >
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                      </button>
                      <span className="line-through">{rem.title}</span>
                    </div>
                    <button
                      onClick={() => handleOpenDelete(rem)}
                      className="p-1 text-charcoal-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingReminder ? "Edit Reminder" : "Schedule New Reminder"}
      >
        <form onSubmit={handleSaveReminder} className="space-y-4">
          <Input
            label="Reminder Title"
            placeholder="e.g. Send thank you note to interviewer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Reminder Type"
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value)}
              options={[
                { value: "FOLLOW_UP", label: "Follow-up" },
                { value: "INTERVIEW", label: "Interview Date" },
                { value: "DEADLINE", label: "Application Deadline" },
                { value: "CUSTOM", label: "Custom Alert" },
              ]}
            />

            <Input
              label="Due Date & Time"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-300 mb-1">
              Link to Application (Optional)
            </label>
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-sm text-charcoal-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-charcoal-600"
            >
              <option value="">-- Standalone Reminder --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} — {app.position}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-700/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              {editingReminder ? "Save Changes" : "Create Reminder"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder?"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
}
