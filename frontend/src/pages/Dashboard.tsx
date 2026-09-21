import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Film, Wand2, Mic, Coins, FolderKanban, HardDrive } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listGenerations } from "@/api/generations";
import { listProjects } from "@/api/projects";
import { GenerationRow } from "@/components/GenerationRow";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState } from "@/components/EmptyState";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: genData } = useQuery({ queryKey: ["dashboard-generations"], queryFn: () => listGenerations({ limit: "6" }) });
  const { data: projects = [] } = useQuery({ queryKey: ["dashboard-projects"], queryFn: listProjects });

  const generations = genData?.generations ?? [];
  const imagesCount = generations.filter((g) => g.type === "image").length;
  const videosCount = generations.filter((g) => g.type === "video").length;

  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8">
      <h1 className="text-xl font-bold mb-1">Welcome back, {user?.name.split(" ")[0]}</h1>
      <p className="text-sm text-ink-muted mb-8">Here's what's happening in your workspace.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <StatCard icon={Coins} label="Credits" value={user?.credits.toLocaleString() ?? "0"} accent />
        <StatCard icon={ImageIcon} label="Images" value={String(imagesCount)} />
        <StatCard icon={Film} label="Videos" value={String(videosCount)} />
        <StatCard icon={FolderKanban} label="Projects" value={String(projects.length)} />
        <StatCard icon={HardDrive} label="Plan" value={user?.plan ?? "free"} capitalize />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <QuickAction icon={ImageIcon} label="Create Image" href="/image" />
        <QuickAction icon={Film} label="Create Video" href="/video" />
        <QuickAction icon={Wand2} label="Edit Image" href="/image/edit" />
        <QuickAction icon={Mic} label="Create Audio" href="/audio" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Recent generations</h2>
            <Link to="/history" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          {generations.length === 0 ? (
            <EmptyState icon={ImageIcon} title="Nothing yet" description="Start your first generation." actionLabel="Create Image" actionHref="/image" />
          ) : (
            <div className="space-y-1">{generations.map((g) => <GenerationRow key={g._id} generation={g} />)}</div>
          )}
        </section>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Recent projects</h2>
            <Link to="/projects" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          {projects.length === 0 ? (
            <EmptyState icon={FolderKanban} title="No projects" description="Create a project to organize your work." />
          ) : (
            <div className="grid grid-cols-2 gap-3">{projects.slice(0, 4).map((p) => <ProjectCard key={p._id} project={p} />)}</div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, capitalize }: { icon: typeof Coins; label: string; value: string; accent?: boolean; capitalize?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-panel p-4">
      <Icon size={16} className={accent ? "text-accent" : "text-ink-muted"} />
      <p className={`text-xl font-bold mt-2 ${capitalize ? "capitalize" : ""}`}>{value}</p>
      <p className="text-xs text-ink-muted mt-0.5">{label}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, href }: { icon: typeof ImageIcon; label: string; href: string }) {
  return (
    <Link to={href} className="rounded-2xl border border-border bg-panel p-4 flex flex-col items-center gap-2 hover:border-accent/30 transition-colors text-center">
      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
        <Icon size={16} className="text-accent" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
