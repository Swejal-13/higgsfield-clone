import { Link } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import { Project } from "@/types";
import { mediaUrl, formatRelativeTime } from "@/utils/format";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project._id}`} className="group rounded-2xl border border-border bg-panel overflow-hidden hover:border-accent/30 transition-colors block">
      <div className="aspect-video bg-panel-secondary flex items-center justify-center">
        {project.coverImage ? (
          <img src={mediaUrl(project.coverImage)} className="w-full h-full object-cover" alt={project.name} />
        ) : (
          <FolderKanban size={28} className="text-ink-muted" />
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-ink truncate">{project.name}</p>
        <p className="text-xs text-ink-muted mt-1 line-clamp-2">{project.description || "No description"}</p>
        <p className="text-[11px] text-ink-muted/70 mt-2">Updated {formatRelativeTime(project.updatedAt)}</p>
      </div>
    </Link>
  );
}
