import { api } from "./client";

export async function updateProfileRequest(updates: { name?: string; avatar?: string }) {
  const { data } = await api.put("/settings/profile", updates);
  return data.data.user;
}

export async function changePasswordRequest(currentPassword: string, newPassword: string) {
  await api.put("/settings/password", { currentPassword, newPassword });
}

export async function listApiKeysRequest() {
  const { data } = await api.get("/settings/api-keys");
  return data.data.keys as Array<{ _id: string; label: string; keyPrefix: string; revoked: boolean; createdAt: string }>;
}

export async function createApiKeyRequest(label: string) {
  const { data } = await api.post("/settings/api-keys", { label });
  return data.data.key as { id: string; label: string; keyPrefix: string; rawKey: string };
}

export async function revokeApiKeyRequest(id: string) {
  await api.delete(`/settings/api-keys/${id}`);
}
