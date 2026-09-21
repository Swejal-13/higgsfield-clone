import { api } from "./client";

export async function fetchCredits() {
  const { data } = await api.get("/credits");
  return data.data as { credits: number; plan: string };
}

export async function fetchCreditTransactions() {
  const { data } = await api.get("/credits/transactions");
  return data.data.transactions as Array<{ _id: string; amount: number; reason: string; balanceAfter: number; createdAt: string }>;
}
