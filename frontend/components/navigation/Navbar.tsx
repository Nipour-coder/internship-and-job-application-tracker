"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, LogOut } from "lucide-react";
import { navigationItems } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { AppLogo } from "@/components/ui/AppLogo";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide on public pages (landing, login, register)
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-charcoal-900 border-b border-charcoal-700 px-4 py-3 flex items-center justify-between shadow-md">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <AppLogo size={30} />
          <span className="font-bold text-charcoal-100 text-sm">Internship Tracker</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="p-2 text-charcoal-400 hover:text-charcoal-100 rounded-lg hover:bg-charcoal-800"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-charcoal-400 hover:text-charcoal-100 rounded-lg hover:bg-charcoal-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex">
          <div className="w-72 bg-charcoal-900 border-r border-charcoal-700 h-full flex flex-col justify-between p-4 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-charcoal-750 mb-4">
                <div className="flex items-center gap-2.5">
                  <AppLogo size={30} />
                  <span className="font-bold text-charcoal-100 text-sm">Internship Tracker</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-charcoal-400 hover:text-charcoal-200 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20"
                          : "text-charcoal-400 hover:bg-charcoal-800 hover:text-charcoal-100"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-indigo-400" : "text-charcoal-500"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-charcoal-750">
              <div className="px-2 py-2 mb-2 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-charcoal-750 border border-charcoal-600 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {user?.fullName?.charAt(0) || "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-charcoal-100 truncate">{user?.fullName || "Student"}</p>
                  <p className="text-xs text-charcoal-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
}
