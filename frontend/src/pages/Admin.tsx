import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Users, Cpu, Wand2, Activity, ShieldCheck } from "lucide-react";
import { formatRelativeTime } from "@/utils/format";

const TABS = ["Overview", "Users", "Models", "Effects", "Generations"] as const;

async function fetchAdmin(path: string) {
  const { data } = await api.get(`/admin/${path}`);
  return data.data;
}

export default function Admin() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchAdmin("stats"), enabled: tab === "Overview" });
  const { data: usersData } = useQuery({ queryKey: ["admin-users"], queryFn: () => fetchAdmin("users"), enabled: tab === "Users" });
  const { data: modelsData } = useQuery({ queryKey: ["admin-models"], queryFn: () => fetchAdmin("models"), enabled: tab === "Models" });
  const { data: effectsData } = useQuery({ queryKey: ["admin-effects"], queryFn: () => fetchAdmin("effects"), enabled: tab === "Effects" });
  const { data: generationsData } = useQuery({ queryKey: ["admin-generations"], queryFn: () => fetchAdmin("generations"), enabled: tab === "Generations" });

  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldCheck size={19} className="text-accent" /> Admin</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${tab === t ? "bg-accent text-black border-accent" : "bg-panel text-ink-muted border-border hover:text-ink"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Users" value={stats.userCount} />
          <StatCard icon={Activity} label="Generations" value={stats.generationCount} />
          <StatCard icon={Activity} label="Failed" value={stats.failedCount} />
          <StatCard icon={Cpu} label="Models" value={stats.modelCount} />
          <StatCard icon={Wand2} label="Effects" value={stats.effectCount} />
        </div>
      )}

      {tab === "Users" && (
        <Table headers={["Name", "Email", "Plan", "Credits", "Role", "Joined"]}>
          {(usersData?.users ?? []).map((u: any) => (
            <tr key={u._id} className="border-t border-border">
              <Td>{u.name}</Td><Td>{u.email}</Td><Td className="capitalize">{u.plan}</Td><Td>{u.credits}</Td><Td className="capitalize">{u.role}</Td><Td>{formatRelativeTime(u.createdAt)}</Td>
            </tr>
          ))}
        </Table>
      )}

      {tab === "Models" && (
        <Table headers={["Name", "Type", "Credits", "Badge", "Enabled"]}>
          {(modelsData?.models ?? []).map((m: any) => (
            <tr key={m.id} className="border-t border-border">
              <Td>{m.name}</Td><Td className="capitalize">{m.type}</Td><Td>{m.credits}</Td><Td>{m.badge || "—"}</Td><Td>{m.enabled ? "Yes" : "No"}</Td>
            </tr>
          ))}
        </Table>
      )}

      {tab === "Effects" && (
        <Table headers={["Name", "Category", "Type"]}>
          {(effectsData?.effects ?? []).map((e: any) => (
            <tr key={e.id} className="border-t border-border">
              <Td>{e.name}</Td><Td>{e.category}</Td><Td className="capitalize">{e.type}</Td>
            </tr>
          ))}
        </Table>
      )}

      {tab === "Generations" && (
        <Table headers={["Type", "Model", "Status", "Credits", "Created"]}>
          {(generationsData?.generations ?? []).map((g: any) => (
            <tr key={g._id} className="border-t border-border">
              <Td className="capitalize">{g.type}</Td><Td>{g.modelId}</Td><Td>{g.status}</Td><Td>{g.creditsUsed}</Td><Td>{formatRelativeTime(g.createdAt)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-panel p-4">
      <Icon size={16} className="text-accent" />
      <p className="text-xl font-bold mt-2">{value}</p>
      <p className="text-xs text-ink-muted mt-0.5">{label}</p>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>{headers.map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 ${className}`}>{children}</td>;
}
