import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Coins, FolderKanban, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listGenerations } from "@/api/generations";
import { listProjects } from "@/api/projects";
import { GenerationRow } from "@/components/GenerationRow";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState } from "@/components/EmptyState";

// The old dashboard opened with five stat cards duplicating numbers already
// on the Settings > Credits tab, plus a quick-action grid that duplicated
// the left rail. Cut both. What's left answers one question: "what's going
// on in my workspace, and what should I do next?"
export default function Dashboard() {
  const { user } = useAuth();
  const { data: genData } = useQuery({ queryKey: ["dashboard-generations"], queryFn: () => listGenerations({ limit: "5" }) });
  const { data: projects = [] } = useQuery({ queryKey: ["dashboard-projects"], queryFn: listProjects });

  const generations = genData?.generations ?? [];

  return (
    <div className="max-w-[820px] mx-auto px-4 lg:px-6 py-10 w-full">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-2xl font-semibold mb-1">Welcome back, {user?.name.split(" ")[0]}</h1>
          <p className="text-sm text-ink-muted">Here's what's going on in your workspace.</p>
        </div>
        <Link to="/create" className="btn-primary text-sm flex items-center gap-1.5 shrink-0">
          <Plus size={15} /> New creation
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-10 rounded-card border border-border bg-panel px-4 py-3 w-fit">
        <Coins size={15} className="text-accent" />
        <span className="text-sm font-semibold">{user?.credits.toLocaleString() ?? 0} credits</span>
        <span className="text-xs text-ink-muted capitalize">· {user?.plan ?? "free"} plan</span>
        <Link to="/settings" className="text-xs text-accent hover:underline ml-2">Manage</Link>
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-muted">Recent generations</h2>
          <Link to="/library" className="text-xs text-accent hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>
        {generations.length === 0 ? (
          <EmptyState icon={Coins} title="Nothing yet" description="Start your first generation and it will show up here." actionLabel="Create something" actionHref="/create" />
        ) : (
          <div className="space-y-1">{generations.map((g) => <GenerationRow key={g._id} generation={g} />)}</div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-muted">Projects</h2>
          <Link to="/projects" className="text-xs text-accent hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>
        {projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No projects" description="Create a project to organize your work." actionLabel="Go to projects" actionHref="/projects" />
        ) : (
          <div className="grid grid-cols-2 gap-3">{projects.slice(0, 4).map((p) => <ProjectCard key={p._id} project={p} />)}</div>
        )}
      </section>
    </div>
  );
}
