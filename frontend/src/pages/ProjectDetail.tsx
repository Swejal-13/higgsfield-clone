import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, Image as ImageIcon } from "lucide-react";
import { getProjectDetail, deleteProjectRequest } from "@/api/projects";
import { MediaCard } from "@/components/MediaCard";
import { ImageViewer } from "@/components/ImageViewer";
import { GenerationRow } from "@/components/GenerationRow";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/contexts/ToastContext";
import { Asset } from "@/types";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [viewerAsset, setViewerAsset] = useState<Asset | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectDetail(id!),
    enabled: !!id,
  });

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await deleteProjectRequest(id);
    toast("Project deleted", "success");
    qc.invalidateQueries({ queryKey: ["projects"] });
    navigate("/projects");
  }

  if (isLoading) return null;
  if (!data) return <EmptyState icon={ImageIcon} title="Project not found" description="It may have been deleted." actionLabel="Back to Projects" actionHref="/projects" />;

  const { project, assets, generations } = data;

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-8">
      <button onClick={() => navigate("/projects")} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4">
        <ArrowLeft size={14} /> Back to projects
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-ink-muted mt-1">{project.description || "No description"}</p>
        </div>
        <button onClick={handleDelete} className="text-xs text-red-400 flex items-center gap-1.5 hover:underline shrink-0">
          <Trash2 size={13} /> Delete project
        </button>
      </div>

      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted mb-4">Assets ({assets.length})</h2>
        {assets.length === 0 ? (
          <p className="text-sm text-ink-muted">No assets in this project yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {assets.map((a) => <MediaCard key={a._id} asset={a} onOpenFullscreen={() => setViewerAsset(a)} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted mb-4">Generations ({generations.length})</h2>
        {generations.length === 0 ? (
          <p className="text-sm text-ink-muted">No generations linked to this project yet.</p>
        ) : (
          <div className="space-y-1">
            {generations.map((g) => <GenerationRow key={g._id} generation={g} />)}
          </div>
        )}
      </section>

      <ImageViewer asset={viewerAsset} onClose={() => setViewerAsset(null)} />
    </div>
  );
}
