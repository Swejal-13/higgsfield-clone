import { Link } from "react-router-dom";
import { Image as ImageIcon, Film, Music, Loader2, CheckCircle2, XCircle, Ban } from "lucide-react";
import { Generation, Asset } from "@/types";
import { mediaUrl, formatRelativeTime } from "@/utils/format";

const STATUS_STYLE: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  COMPLETED: { icon: CheckCircle2, className: "text-emerald-400" },
  FAILED: { icon: XCircle, className: "text-red-400" },
  CANCELLED: { icon: Ban, className: "text-ink-muted" },
  QUEUED: { icon: Loader2, className: "text-amber-400 animate-spin" },
  PROCESSING: { icon: Loader2, className: "text-amber-400 animate-spin" },
};

const TYPE_ICON = { image: ImageIcon, video: Film, audio: Music };

export function GenerationRow({ generation }: { generation: Generation }) {
  const status = STATUS_STYLE[generation.status];
  const StatusIcon = status.icon;
  const TypeIcon = TYPE_ICON[generation.type];
  const outputs = Array.isArray(generation.outputAssets) ? (generation.outputAssets as Asset[]) : [];
  const thumb = outputs[0]?.thumbnailUrl || outputs[0]?.url;

  return (
    <Link
      to={`/library?open=${generation._id}`}
      className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-panel-secondary transition-colors border border-transparent hover:border-border"
    >
      <div className="w-14 h-14 rounded-lg bg-panel-secondary overflow-hidden shrink-0 flex items-center justify-center">
        {thumb ? (
          <img src={mediaUrl(thumb)} alt="" className="w-full h-full object-cover" />
        ) : (
          <TypeIcon size={18} className="text-ink-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink truncate">{generation.prompt || `${generation.action} — ${generation.type}`}</p>
        <p className="text-xs text-ink-muted mt-0.5">
          {generation.modelId} · {formatRelativeTime(generation.createdAt)} · {generation.creditsUsed} credits
        </p>
      </div>
      <div className={`flex items-center gap-1.5 text-xs shrink-0 ${status.className}`}>
        <StatusIcon size={14} />
        {generation.status !== "PROCESSING" && generation.status !== "QUEUED" && (
          <span className="capitalize">{generation.status.toLowerCase()}</span>
        )}
      </div>
    </Link>
  );
}
