"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  Sparkles,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchNotifications();
    }
  }, [user, authLoading]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest<{
        success: boolean;
        unreadCount: number;
        notifications: any[];
      }>("/notifications");

      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err: any) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PUT" });
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest("/notifications/read-all", { method: "PUT" });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error("Failed to mark all read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "STATUS_CHANGE":
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
      case "DEADLINE":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "INTERVIEW":
        return <Clock className="w-5 h-5 text-purple-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charcoal-700/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal-100 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-xs">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-charcoal-400 mt-1">
            Stay informed with application updates, deadline warnings, and reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton message="Loading notifications..." count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet."
          description="When your applications change status or reminders come due, they'll appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`flex items-start justify-between gap-4 p-4 transition-all ${
                !notif.isRead
                  ? "bg-indigo-500/10 border-indigo-500/30 shadow-xs"
                  : "bg-charcoal-850 border-charcoal-700/80 opacity-80"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !notif.isRead ? "bg-indigo-500/20 text-indigo-400" : "bg-charcoal-900 text-charcoal-400 border border-charcoal-700"
                  }`}
                >
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-charcoal-100">{notif.title}</h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-charcoal-300 mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-charcoal-400 mt-1.5">
                    {new Date(notif.createdAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="p-1.5 text-charcoal-400 hover:text-indigo-400 rounded-md hover:bg-charcoal-800 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
