"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  FileText,
  BellRing,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppLogo } from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-charcoal-900 text-charcoal-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-charcoal-700 bg-charcoal-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Application Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <AppLogo size={36} />
            <div className="flex flex-col">
              <span className="font-bold text-charcoal-100 text-base sm:text-lg tracking-tight leading-tight group-hover:text-indigo-300 transition-colors">
                Internship & Job Tracker
              </span>
              <span className="text-[11px] text-charcoal-400 font-medium hidden sm:block">
                For Students & Early-Career Seekers
              </span>
            </div>
          </Link>

          {/* Navigation Links and Action Buttons */}
          <nav className="flex items-center gap-4 sm:gap-6">
            <a
              href="#about"
              className="text-sm font-medium text-charcoal-300 hover:text-charcoal-100 transition-colors hidden md:inline-block"
            >
              About
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-charcoal-300 hover:text-charcoal-100 transition-colors hidden md:inline-block"
            >
              Features
            </a>

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-charcoal-700 hover:border-charcoal-500 text-charcoal-200"
                  >
                    Login
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
            )}
          </nav>
        </div>
      </header>

      {/* 2. Hero Section with Watermark Background Logo */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 border-b border-charcoal-800">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-sky-500/10 blur-3xl rounded-full pointer-events-none -z-0"
          aria-hidden="true"
        />

        {/* 5. LOGO WATERMARK BACKGROUND EFFECT: Large, centered, low-opacity logo behind hero text */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0 select-none overflow-hidden"
          aria-hidden="true"
        >
          <AppLogo
            variant="watermark"
            className="w-[340px] h-[340px] sm:w-[540px] sm:h-[540px] lg:w-[680px] lg:h-[680px] text-indigo-400 opacity-[0.05] sm:opacity-[0.065] transform scale-100 transition-transform duration-1000"
          />
        </div>

        {/* Hero Content (Above Watermark) */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/70 text-indigo-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Internship & Early-Career Application Tracker</span>
          </div>

          {/* Main Heading: Strong and professional statement */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-100 tracking-tight leading-[1.15]">
            Centralize Your Applications.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400">
              Accelerate Your Career.
            </span>
          </h1>

          {/* Short Description: Brief, simple explanation of what users can do */}
          <p className="text-base sm:text-lg lg:text-xl text-charcoal-300 max-w-2xl mx-auto leading-relaxed">
            Stop juggling spreadsheets and missed deadlines. Manage your entire recruiting journey—from active job discovery and stage-by-stage pipelines to student CV export and automated follow-up reminders.
          </p>

          {/* Clear Call-To-Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-8 text-base font-semibold shadow-lg shadow-indigo-950/60"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto px-8 text-base font-semibold shadow-lg shadow-indigo-950/60"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto px-6 text-base font-medium border border-charcoal-700 hover:border-charcoal-600 bg-charcoal-800 text-charcoal-200"
                  >
                    Create Account
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 text-base font-medium border-charcoal-700 hover:border-charcoal-500 text-charcoal-300 hover:text-charcoal-100"
                  >
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Social Proof & Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-charcoal-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free for students & graduates
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> 100% Private data isolation
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400" /> Zero complex spreadsheets
            </span>
          </div>
        </div>
      </section>

      {/* 3. About / What the App Does Section */}
      <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-charcoal-800 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-charcoal-700">
            Overview
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-100 tracking-tight">
            What Does This App Do?
          </h2>
          <p className="text-sm sm:text-base text-charcoal-400 leading-relaxed">
            The platform is a purpose-built career management workspace designed specifically for university students, recent graduates, and early-career candidates navigating internship recruiting cycles.
          </p>
        </div>

        {/* 4 Core Feature Cards (Using Actual Application Functionality) */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 scroll-mt-20">
          {/* Feature 1: Manage Applications */}
          <div className="bg-charcoal-850 border border-charcoal-700 hover:border-indigo-500/50 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/30 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-100 group-hover:text-indigo-300 transition-colors">
                Manage Applications
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-400 leading-relaxed">
                Log and track every job application across 4 distinct stages: <strong className="text-charcoal-200">Applied</strong>, <strong className="text-charcoal-200">Interview</strong>, <strong className="text-charcoal-200">Offer</strong>, and <strong className="text-charcoal-200">Rejected</strong>. Keep interview dates, notes, and salary logs in one structured record.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-charcoal-750 flex items-center gap-1 text-xs font-semibold text-indigo-400">
              <span>Stage-by-stage pipelines</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 2: Find Opportunities */}
          <div className="bg-charcoal-850 border border-charcoal-700 hover:border-sky-500/50 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:shadow-xl hover:shadow-sky-950/30 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-sky-500/20 transition-all">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-100 group-hover:text-sky-300 transition-colors">
                Find Opportunities
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-400 leading-relaxed">
                Explore real-time internship and graduate listings across South Africa and remote markets. Bookmark interesting listings or convert saved jobs into active tracked applications with a single click.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-charcoal-750 flex items-center gap-1 text-xs font-semibold text-sky-400">
              <span>Verified active listings</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 3: Build Your CV */}
          <div className="bg-charcoal-850 border border-charcoal-700 hover:border-purple-500/50 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/30 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-500/20 transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-100 group-hover:text-purple-300 transition-colors">
                Build Your CV
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-400 leading-relaxed">
                Construct a clean, professional CV tailored for internships. Input coursework, academic achievements, work experience, and tech stacks with instant live preview and direct client PDF generation.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-charcoal-750 flex items-center gap-1 text-xs font-semibold text-purple-400">
              <span>Live preview & PDF download</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 4: Track Your Progress */}
          <div className="bg-charcoal-850 border border-charcoal-700 hover:border-amber-500/50 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/30 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-500/20 transition-all">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-100 group-hover:text-amber-300 transition-colors">
                Track Your Progress
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-400 leading-relaxed">
                Never lose momentum. Background timers detect applications stagnant for 14 days to nudge polite follow-up emails, while automated 24-hour alerts keep you fully prepared for scheduled interviews.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-charcoal-750 flex items-center gap-1 text-xs font-semibold text-amber-400">
              <span>Automated alerts & nudges</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Why Students Love It Summary Callout */}
        <div className="mt-14 p-8 rounded-2xl bg-charcoal-850/80 border border-charcoal-750 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-lg font-bold text-charcoal-100">Built with 100% User Data Isolation</h4>
            <p className="text-xs sm:text-sm text-charcoal-400 max-w-2xl">
              Every job application, interview note, resume entry, and reminder is cryptographically isolated by your authenticated user credentials. No shared boards, no third-party data leakage.
            </p>
          </div>
          <Link href="/register" className="shrink-0">
            <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. Ready to Get Started Bottom Banner */}
      <section className="bg-charcoal-850/50 border-t border-charcoal-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-charcoal-100 tracking-tight">
            Ready to Take Control of Your Career Journey?
          </h2>
          <p className="text-sm sm:text-base text-charcoal-400 max-w-xl mx-auto">
            Join students and early-career job seekers using the tracker to land summer internships, co-ops, and graduate roles.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 font-semibold shadow-lg shadow-indigo-950/60">
                Get Started Now — It&apos;s Free
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 border-charcoal-700 text-charcoal-300 hover:text-charcoal-100">
                Sign In to Existing Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Clean Modern Footer */}
      <footer className="mt-auto border-t border-charcoal-800 bg-charcoal-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-400">
          <div className="flex items-center gap-2">
            <AppLogo size={24} />
            <span className="font-semibold text-charcoal-200">Internship & Job Tracker</span>
            <span>© {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-charcoal-200 transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-charcoal-200 transition-colors">
              Features
            </a>
            <Link href="/login" className="hover:text-charcoal-200 transition-colors">
              Login
            </Link>
            <Link href="/register" className="hover:text-charcoal-200 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
