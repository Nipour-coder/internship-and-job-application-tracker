"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function EditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [dateApplied, setDateApplied] = useState("");
  const [notes, setNotes] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [salary, setSalary] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
        const app = res.application;
        setCompany(app.company || "");
        setPosition(app.position || "");
        setLocation(app.location || "");
        setStatus(app.status || "APPLIED");
        setDateApplied(
          app.dateApplied
            ? new Date(app.dateApplied).toISOString().split("T")[0]
            : ""
        );
        setNotes(app.notes || "");
        setJobUrl(app.jobUrl || "");
        setSalary(app.salary || "");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load application for editing.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!company.trim() || !position.trim()) {
      setError("Company and Job title are required.");
      return;
    }

    try {
      setIsSaving(true);
      await apiRequest(`/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          company: company.trim(),
          position: position.trim(),
          location: location.trim() || null,
          status,
          dateApplied: dateApplied || new Date().toISOString(),
          notes: notes.trim() || null,
          jobUrl: jobUrl.trim() || null,
          salary: salary.trim() || null,
        }),
      });

      router.push(`/applications/${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update application.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton message="Loading application for editing..." count={2} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/applications/${id}`}
          className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-100 hover:bg-charcoal-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">Edit Application</h1>
          <p className="text-sm text-charcoal-400">Update status, interview notes, or dates.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
            <Input
              label="Job / Role Title"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Application Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "APPLIED", label: "Applied" },
                { value: "INTERVIEW", label: "Interview" },
                { value: "OFFER", label: "Offer" },
                { value: "REJECTED", label: "Rejected" },
              ]}
            />
            <Input
              label="Date Applied"
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="Salary / Compensation"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

          <Input
            label="Job Posting URL"
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-charcoal-300 mb-1">
              Notes & Interview Details
            </label>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg shadow-sm text-sm text-charcoal-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-charcoal-600 placeholder-charcoal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal-700/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/applications/${id}`)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />} isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
