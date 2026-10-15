"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { completeLogin } = useAuth();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      setError("The social sign-in response did not contain a session. Please try again.");
      return;
    }

    completeLogin(token)
      .then(() => router.replace("/dashboard"))
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Unable to verify the social sign-in session.");
      });
  }, [completeLogin, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-charcoal-900 px-4 text-charcoal-100">
      <section className="w-full max-w-md rounded-2xl border border-charcoal-700 bg-charcoal-850 p-8 text-center">
        {error ? (
          <>
            <AlertCircle className="mx-auto mb-4 h-8 w-8 text-rose-400" />
            <h1 className="text-xl font-semibold">Sign-in could not be completed</h1>
            <p className="mt-3 text-sm text-charcoal-300">{error}</p>
            <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-indigo-400 hover:text-indigo-300">
              Return to sign in
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-400" />
            <h1 className="text-xl font-semibold">Completing sign-in</h1>
            <p className="mt-3 text-sm text-charcoal-300">Verifying your account with the tracker.</p>
          </>
        )}
      </section>
    </main>
  );
}
