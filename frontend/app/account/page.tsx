"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Calendar,
  ShieldCheck,
  LogOut,
  Save,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!newPassword || !confirmNewPassword) {
      setPasswordError("Please enter all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">Account & Profile</h1>
        <p className="text-sm text-charcoal-400 mt-1">
          Manage your personal details and account credentials.
        </p>
      </div>

      {/* User Information Card */}
      <Card>
        <div className="flex items-center gap-4 pb-6 border-b border-charcoal-700/60">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-950/40">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-charcoal-100">{user?.fullName || "Student"}</h2>
            <p className="text-sm text-charcoal-400">{user?.email}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-2 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> Active Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-sm">
          <div className="flex items-center gap-3 text-charcoal-300">
            <Mail className="w-4 h-4 text-charcoal-400" />
            <div>
              <p className="text-xs text-charcoal-400">Email Address</p>
              <p className="font-medium text-charcoal-200">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-charcoal-300">
            <UserIcon className="w-4 h-4 text-charcoal-400" />
            <div>
              <p className="text-xs text-charcoal-400">Account Role</p>
              <p className="font-medium text-charcoal-200">Job & Internship Candidate</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Password & Security Card */}
      <Card>
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-charcoal-700/60">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-charcoal-100">Change Password</h2>
        </div>

        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> Password updated successfully.
          </div>
        )}

        {passwordError && (
          <p className="mb-4 text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/30">
            {passwordError}
          </p>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" icon={<Save className="w-4 h-4" />}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Logout Card */}
      <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-rose-500/30 bg-rose-500/10">
        <div>
          <h3 className="text-sm font-semibold text-charcoal-100">Log Out of Your Account</h3>
          <p className="text-xs text-charcoal-400 mt-0.5">
            This will end your current session on this device.
          </p>
        </div>
        <Button
          variant="danger"
          size="sm"
          icon={<LogOut className="w-4 h-4" />}
          onClick={logout}
        >
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
