import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { History as HistoryIcon, HardDrive, Upload } from "lucide-react";
import { listGenerations } from "@/api/generations";
import { listAssets, uploadAsset } from "@/api/assets";
import { GenerationRow } from "@/components/GenerationRow";
import { MediaCard } from "@/components/MediaCard";
import { EmptyState } from "@/components/EmptyState";
import { ImageViewer } from "@/components/ImageViewer";
import { useToast } from "@/contexts/ToastContext";
import { Asset } from "@/types";

const TABS = ["Generations", "Uploads"] as const;
const TYPE_FILTERS = ["All", "Images", "Videos", "Audio"] as const;
const STATUS_FILTERS = ["All", "Completed", "Processing", "Failed"] as const;

// Everything you made (generations) and everything you brought in (uploads)
// lived on two separate pages before, even though both answer the same
// question: "what do I have to work with?" One page, two tabs.
export default function Library() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Generations");
  const [type, setType] = useState<(typeof TYPE_FILTERS)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [viewerAsset, setViewerAsset] = useState<Asset | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const typeParam = type === "Images" ? "image" : type === "Videos" ? "video" : type === "Audio" ? "audio" : "all";
  const statusParam = status === "All" ? "all" : status.toUpperCase();

  const { data: genData, isLoading: genLoading } = useQuery({
    queryKey: ["library-generations", typeParam, statusParam],
    queryFn: () => listGenerations({ type: typeParam, status: statusParam, sort: "newest" }),
    refetchInterval: 5000,
    enabled: tab === "Generations",
  });

  const { data: assetData, isLoading: assetsLoading } = useQuery({
    queryKey: ["library-assets", typeParam],
    queryFn: () => listAssets({ type: typeParam }),
    enabled: tab === "Uploads",
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      for (const file of files) {
        try {
          await uploadAsset(file);
        } catch {
          toast(`Failed to upload ${file.name}`, "error");
        }
      }
      qc.invalidateQueries({ queryKey: ["library-assets"] });
      toast("Upload complete", "success");
    },
    noClick: true,
  });

  const generations = genData?.generations ?? [];
  const assets = assetData?.assets ?? [];
  const openId = params.get("open");
  const openGeneration = generations.find((g) => g._id === openId);
  const openAsset = openGeneration && Array.isArray(openGeneration.outputAssets) ? (openGeneration.outputAssets as Asset[])[0] : undefined;

  return (
    <div {...getRootProps()} className={`max-w-[1100px] mx-auto px-4 lg:px-6 py-8 w-full ${isDragActive ? "bg-accent/5" : ""}`}>
      <input {...getInputProps()} />

      <div className="flex items-center gap-1 mb-6 border border-border rounded-lg p-1 w-fit bg-panel">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t ? "bg-accent/10 text-accent" : "text-ink-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {TYPE_FILTERS.map((t) => (
          <FilterPill key={t} active={type === t} onClick={() => setType(t)} label={t} />
        ))}
        {tab === "Generations" && (
          <>
            <span className="w-px h-5 bg-border mx-1" />
            {STATUS_FILTERS.map((s) => (
              <FilterPill key={s} active={status === s} onClick={() => setStatus(s)} label={s} />
            ))}
          </>
        )}
        {tab === "Uploads" && (
          <button
            onClick={() => document.getElementById("library-upload-input")?.click()}
            className="ml-auto btn-secondary text-xs !py-1.5 !px-3 flex items-center gap-1.5"
          >
            <Upload size={13} /> Upload
          </button>
        )}
      </div>

      {isDragActive && (
        <div className="border-2 border-dashed border-accent rounded-card p-10 text-center text-accent text-sm mb-6">Drop files to upload</div>
      )}

      {tab === "Generations" ? (
        <>
          {!genLoading && generations.length === 0 && (
            <EmptyState icon={HistoryIcon} title="No generations yet" description="Everything you generate will be logged here." actionLabel="Create something" actionHref="/create" />
          )}
          <div className="space-y-1">
            {generations.map((g) => <GenerationRow key={g._id} generation={g} />)}
          </div>
        </>
      ) : (
        <>
          {!assetsLoading && assets.length === 0 && (
            <EmptyState icon={HardDrive} title="No uploads yet" description="Files you upload, or generated media you save, will show up here." />
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {assets.map((a) => (
              <MediaCard key={a._id} asset={a} onOpenFullscreen={() => setViewerAsset(a)} onDeleted={() => qc.invalidateQueries({ queryKey: ["library-assets"] })} />
            ))}
          </div>
        </>
      )}

      {openAsset && <ImageViewer asset={openAsset} onClose={() => window.history.back()} />}
      {viewerAsset && <ImageViewer asset={viewerAsset} onClose={() => setViewerAsset(null)} />}

      <input
        id="library-upload-input"
        type="file"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          await uploadAsset(file);
          qc.invalidateQueries({ queryKey: ["library-assets"] });
          toast("Uploaded", "success");
        }}
      />
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
