"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function NewApplicationPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [dateApplied, setDateApplied] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [salary, setSalary] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!company.trim() || !position.trim()) {
      setError("Company name and Job title are required.");
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest("/applications", {
        method: "POST",
        body: JSON.stringify({
          company: company.trim(),
          position: position.trim(),
          location: location.trim() || undefined,
          status,
          dateApplied,
          notes: notes.trim() || undefined,
          jobUrl: jobUrl.trim() || undefined,
          salary: salary.trim() || undefined,
        }),
      });

      router.push("/applications");
    } catch (err: any) {
      setError(err.message || "Failed to save application.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-charcoal-100">
      <div className="flex items-center gap-3">
        <Link
          href="/applications"
          className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-100 hover:bg-charcoal-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">Add New Application</h1>
          <p className="text-sm text-charcoal-400">Record a job or internship opportunity you applied for.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="e.g. Google, Microsoft, Startup"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />

            <Input
              label="Job / Role Title"
              placeholder="e.g. Software Engineer Intern"
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
              placeholder="e.g. London, Remote, New York"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Input
              label="Salary / Compensation (Optional)"
              placeholder="e.g. £30,000/yr or $45/hr"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

          <Input
            label="Job Posting URL"
            type="url"
            placeholder="https://company.com/careers/..."
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-charcoal-200 mb-1">
              Notes & Follow-up Details
            </label>
            <textarea
              rows={4}
              placeholder="Log referral contacts, interview rounds, prep questions, or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-charcoal-700 rounded-lg shadow-inner text-sm bg-charcoal-900 text-charcoal-100 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 hover:border-charcoal-600 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal-750">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/applications")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />} isLoading={isLoading}>
              Save Application
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
