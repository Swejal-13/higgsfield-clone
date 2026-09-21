import { api } from "./client";
import { AppNotification } from "@/types";

export async function fetchNotifications() {
  const { data } = await api.get("/notifications");
  return data.data as { notifications: AppNotification[]; unreadCount: number };
}

export async function markNotificationReadRequest(id: string) {
  await api.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsReadRequest() {
  await api.put(`/notifications/read-all`);
}
