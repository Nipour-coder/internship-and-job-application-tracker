import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/navigation/AppShell";

export const metadata: Metadata = {
  title: "Internship & Job Application Tracker",
  description:
    "Organize and manage your career search, internship applications, CV building, and job discovery in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-charcoal-900 antialiased text-charcoal-100 min-h-screen">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
