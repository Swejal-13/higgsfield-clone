import { api } from "./client";
import { ModelCapability, ModelType } from "@/types";

export async function fetchModels(type?: ModelType) {
  const { data } = await api.get("/models", { params: type ? { type } : {} });
  return data.data.models as ModelCapability[];
}
