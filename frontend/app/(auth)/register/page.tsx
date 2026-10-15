"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Clock,
  FileText,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AppLogo } from "@/components/ui/AppLogo";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      await register(fullName, email, password, confirmPassword);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-charcoal-100 flex flex-col">
      {/* Top Header Bar with Brand and Top-Right Log In & Sign Up Buttons */}
      <header className="w-full border-b border-charcoal-700 bg-charcoal-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <AppLogo size={36} variant="full" />
          </Link>

          {/* Top-Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-charcoal-700 hover:border-charcoal-500 text-charcoal-200"
              >
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="primary"
                size="sm"
                className="shadow-md shadow-indigo-950/60"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content: Two-Column Split (Briefing & Features on Left, Registration Form on Right) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Platform Briefing, What Does It Do, Benefits & Top Recommendations */}
          <div className="lg:col-span-7 space-y-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dedicated Career Command Center for Students</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal-100 tracking-tight leading-tight">
                Turn Application Chaos into <span className="text-indigo-400">Secured Job Offers.</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-charcoal-300 leading-relaxed max-w-2xl">
                Ditch the messy spreadsheets, scattered email threads, and forgotten follow-ups. Centralize your entire internship and early-career search inside one dedicated, high-performance platform.
              </p>
            </div>

            {/* What Does It Do - Core Capabilities Grid */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
                What Does The Platform Do?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-700/80 hover:border-charcoal-600 transition-colors space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-400 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-charcoal-100">Lifecycle Tracking</h3>
                  <p className="text-xs text-charcoal-400 leading-relaxed">
                    Track every role across stages: <em>Applied</em>, <em>Interview</em>, <em>Offer</em>, and <em>Rejected</em> with notes, salary, and job links.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-700/80 hover:border-charcoal-600 transition-colors space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-charcoal-100">Automated Follow-ups</h3>
                  <p className="text-xs text-charcoal-400 leading-relaxed">
                    Background reminders alert you 24h before interviews and flag applications stagnant for 14+ days to prompt follow-ups.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-700/80 hover:border-charcoal-600 transition-colors space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-charcoal-100">Manual CV Builder & PDF</h3>
                  <p className="text-xs text-charcoal-400 leading-relaxed">
                    Structured, student-specific resume builder with live preview and instant PDF export—without generative AI hallucinations.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-700/80 hover:border-charcoal-600 transition-colors space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800 text-purple-400 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-charcoal-100">Live Opportunity Feed</h3>
                  <p className="text-xs text-charcoal-400 leading-relaxed">
                    Aggregated South African and remote tech opportunities with active deadline filtering and 1-click application conversion.
                  </p>
                </div>
              </div>
            </div>

            {/* Top Recommendation Box ("recommend me the best") */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-charcoal-850 to-charcoal-850 border border-indigo-800/40 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Zap className="w-4 h-4" />
                <span>Our Top Recommendation for Candidates</span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-200 leading-relaxed">
                <strong>The 10-14 Strategy:</strong> Focus on 5 to 10 quality applications per week rather than mass-spamming 50. Use the CV builder to align your skills directly with each job description, bookmark the listing, and let our scheduler prompt you to send a polite follow-up if you haven&apos;t heard back in 14 days.
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-xs text-charcoal-400 border-t border-charcoal-750">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 4x Higher Interview Rate
                </span>
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 0 Missed Recruiter Deadlines
                </span>
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Personal Data Isolation
                </span>
              </div>
            </div>

            {/* Strict Isolation & Security Notice */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-charcoal-850/60 border border-charcoal-700/60 text-xs text-charcoal-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Zero data sharing:</strong> Every application, note, salary log, and CV section is cryptographically scoped to your private user ID.
              </span>
            </div>
          </div>

          {/* Right Column: Account Creation Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-charcoal-850 border border-charcoal-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex mb-3">
                  <AppLogo size={44} />
                </div>
                <h2 className="text-2xl font-bold text-charcoal-100 tracking-tight">Create Your Account</h2>
                <p className="text-xs sm:text-sm text-charcoal-400 mt-1">
                  Start tracking your applications and building your student CV in under 30 seconds.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  id="fullName"
                  placeholder="e.g. Alex Ndlovu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />

                <Input
                  label="Email Address"
                  type="email"
                  id="email"
                  placeholder="alex@university.ac.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  type="password"
                  id="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full text-sm font-semibold shadow-lg shadow-indigo-950/60"
                    isLoading={isLoading}
                  >
                    Create Free Account <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </form>

              <div className="pt-4 border-t border-charcoal-750 text-center space-y-3">
                <p className="text-xs text-charcoal-400">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                    Sign In here
                  </Link>
                </p>
                <p className="text-[11px] text-charcoal-500">
                  By registering, your account is protected under strict personal data isolation guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
