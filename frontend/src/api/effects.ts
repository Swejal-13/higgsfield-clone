import { api } from "./client";
import { Effect } from "@/types";

export async function fetchEffects(category?: string) {
  const { data } = await api.get("/effects", { params: category ? { category } : {} });
  return data.data.effects as Effect[];
}
