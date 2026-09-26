import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon } from "lucide-react";
import { listGenerations } from "@/api/generations";
import { GenerationRow } from "@/components/GenerationRow";
import { EmptyState } from "@/components/EmptyState";
import { ImageViewer } from "@/components/ImageViewer";
import { Asset } from "@/types";

const TYPE_FILTERS = ["All", "Images", "Videos", "Audio"] as const;
const STATUS_FILTERS = ["All", "Completed", "Processing", "Failed"] as const;

export default function HistoryPage() {
  const [params] = useSearchParams();
  const [type, setType] = useState<(typeof TYPE_FILTERS)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [viewerAsset, setViewerAsset] = useState<Asset | null>(null);

  const typeParam = type === "Images" ? "image" : type === "Videos" ? "video" : type === "Audio" ? "audio" : "all";
  const statusParam = status === "All" ? "all" : status.toUpperCase();

  const { data, isLoading } = useQuery({
    queryKey: ["history", typeParam, statusParam, sort],
    queryFn: () => listGenerations({ type: typeParam, status: statusParam, sort }),
    refetchInterval: 5000,
  });

  const generations = data?.generations ?? [];
  const openId = params.get("open");
  const openGeneration = generations.find((g) => g._id === openId);
  const openAsset = openGeneration && Array.isArray(openGeneration.outputAssets) ? (openGeneration.outputAssets as Asset[])[0] : undefined;

  return (
    <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-8">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2"><HistoryIcon size={19} className="text-accent" /> History</h1>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {TYPE_FILTERS.map((t) => (
          <FilterPill key={t} active={type === t} onClick={() => setType(t)} label={t} />
        ))}
        <span className="w-px h-5 bg-border mx-1" />
        {STATUS_FILTERS.map((s) => (
          <FilterPill key={s} active={status === s} onClick={() => setStatus(s)} label={s} />
        ))}
        <div className="flex-1" />
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="bg-panel border border-border rounded-lg text-xs px-2.5 py-1.5 text-ink-muted">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {!isLoading && generations.length === 0 && (
        <EmptyState icon={HistoryIcon} title="No generations yet" description="Everything you generate will be logged here." actionLabel="Create Image" actionHref="/image" />
      )}

      <div className="space-y-1">
        {generations.map((g) => <GenerationRow key={g._id} generation={g} />)}
      </div>

      {openAsset && <ImageViewer asset={openAsset} onClose={() => window.history.back()} />}
      {viewerAsset && <ImageViewer asset={viewerAsset} onClose={() => setViewerAsset(null)} />}
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active ? "bg-accent text-white border-accent" : "bg-panel text-ink-muted border-border hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
