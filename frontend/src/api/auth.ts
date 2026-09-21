import { api } from "./client";
import { User } from "@/types";

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  return data.data as { user: User; token: string };
}

export async function registerRequest(name: string, email: string, password: string) {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data.data as { user: User; token: string };
}

export async function meRequest() {
  const { data } = await api.get("/auth/me");
  return data.data.user as User;
}
