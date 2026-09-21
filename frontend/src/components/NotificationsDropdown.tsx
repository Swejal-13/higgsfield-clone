import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markNotificationReadRequest, markAllNotificationsReadRequest } from "@/api/notifications";
import { formatRelativeTime } from "@/utils/format";

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 15000,
  });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const notifications = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-panel-secondary transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-ink-muted" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[340px] bg-panel border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold">Notifications</p>
              <button
                onClick={async () => {
                  await markAllNotificationsReadRequest();
                  qc.invalidateQueries({ queryKey: ["notifications"] });
                }}
                className="text-xs text-ink-muted hover:text-accent flex items-center gap-1"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 && (
                <p className="text-sm text-ink-muted text-center py-8">No notifications yet.</p>
              )}
              {notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={async () => {
                    if (!n.read) {
                      await markNotificationReadRequest(n._id);
                      qc.invalidateQueries({ queryKey: ["notifications"] });
                    }
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-panel-secondary transition-colors ${!n.read ? "bg-accent/5" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[11px] text-ink-muted/70 mt-1">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
