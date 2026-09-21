import { api } from "./client";
import { Asset } from "@/types";

export async function listAssets(params: Record<string, string> = {}) {
  const { data } = await api.get("/assets", { params });
  return data.data as { assets: Asset[]; total: number };
}

export async function uploadAsset(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/assets/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
  return data.data.asset as Asset;
}

export async function updateAsset(id: string, updates: Partial<Pick<Asset, "favorite" | "filename" | "projectId">>) {
  const { data } = await api.put(`/assets/${id}`, updates);
  return data.data.asset as Asset;
}

export async function deleteAssetRequest(id: string) {
  await api.delete(`/assets/${id}`);
}
