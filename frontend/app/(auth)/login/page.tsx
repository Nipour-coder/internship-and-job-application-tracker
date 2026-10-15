"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AppLogo } from "@/components/ui/AppLogo";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const oauthError = new URLSearchParams(window.location.search).get("error");
    if (!oauthError?.startsWith("oauth_")) {
      return;
    }

    const provider = oauthError.includes("google") ? "Google" : oauthError.includes("github") ? "GitHub" : "Social";
    setError(`${provider} sign-in could not be completed. Please try again or use email and password.`);
    window.history.replaceState(null, "", "/login");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-charcoal-100 flex flex-col">
      {/* Top Header Bar with Brand and Top-Right Log In & Sign Up Buttons */}
      <header className="w-full border-b border-charcoal-700 bg-charcoal-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <AppLogo size={36} variant="full" />
          </Link>

          {/* Top-Right Navigation Buttons */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-charcoal-850 rounded-2xl shadow-2xl border border-charcoal-700 p-8 space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <AppLogo size={48} />
            </div>
            <h2 className="text-2xl font-bold text-charcoal-100 tracking-tight">Welcome Back</h2>
            <p className="text-xs sm:text-sm text-charcoal-400 mt-1">
              Sign in to access your applications, saved jobs, and CV.
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-sm font-semibold shadow-lg shadow-indigo-950/60"
                isLoading={isLoading}
              >
                Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-charcoal-750 text-center space-y-2">
            <p className="text-xs text-charcoal-400">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Create free account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
