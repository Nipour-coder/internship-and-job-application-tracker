"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Search,
  Bookmark,
  FileText,
  BellRing,
  Bell,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppLogo } from "@/components/ui/AppLogo";

export const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Applications", href: "/applications", icon: Briefcase },
  { name: "Jobs", href: "/jobs", icon: Search },
  { name: "Saved Jobs", href: "/saved-jobs", icon: Bookmark },
  { name: "CV Builder", href: "/cv", icon: FileText },
  { name: "Reminders", href: "/reminders", icon: BellRing },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Account", href: "/account", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // If on public pages, do not render sidebar
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-charcoal-900 border-r border-charcoal-700 min-h-screen p-4 justify-between fixed left-0 top-0 bottom-0 z-30">
      <div>
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-3 mb-6">
          <AppLogo size={36} />
          <div>
            <h1 className="font-bold text-charcoal-100 leading-tight text-base tracking-tight">Tracker</h1>
            <p className="text-xs text-charcoal-400 font-medium">Internship & Career</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20"
                    : "text-charcoal-400 hover:bg-charcoal-800 hover:text-charcoal-100"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-indigo-400" : "text-charcoal-500 group-hover:text-charcoal-300"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="pt-4 border-t border-charcoal-750">
        <div className="px-3 py-2 mb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-charcoal-750 border border-charcoal-600 text-indigo-400 flex items-center justify-center font-bold text-sm">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-charcoal-100 truncate">{user?.fullName || "Student"}</p>
            <p className="text-xs text-charcoal-400 truncate">{user?.email || "student@career.edu"}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
