"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Navbar } from "@/components/navigation/Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/auth/callback";

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-charcoal-900 text-charcoal-100">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-charcoal-900 text-charcoal-100">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
