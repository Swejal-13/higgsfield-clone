import { api } from "./client";
import { Generation, GenerationType } from "@/types";

export interface CreateGenerationInput {
  type: GenerationType;
  action?: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  settings?: Record<string, unknown>;
  inputAssets?: string[];
  projectId?: string;
}

export async function createGeneration(input: CreateGenerationInput) {
  const { data } = await api.post("/generations", input);
  return data.data.generation as Generation;
}

export async function getGenerationStatus(id: string) {
  const { data } = await api.get(`/generations/${id}/status`);
  return data.data as Generation;
}

export async function listGenerations(params: Record<string, string> = {}) {
  const { data } = await api.get("/generations", { params });
  return data.data as { generations: Generation[]; total: number; page: number; pages: number };
}

export async function deleteGenerationRequest(id: string) {
  await api.delete(`/generations/${id}`);
}

export async function cancelGenerationRequest(id: string) {
  const { data } = await api.post(`/generations/${id}/cancel`);
  return data.data.generation as Generation;
}
