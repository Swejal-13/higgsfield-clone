import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { LayoutGrid, List, Upload, Image as ImageIcon } from "lucide-react";
import { listAssets, uploadAsset } from "@/api/assets";
import { MediaCard } from "@/components/MediaCard";
import { ImageViewer } from "@/components/ImageViewer";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/contexts/ToastContext";
import { mediaUrl, formatBytes, formatRelativeTime } from "@/utils/format";
import { Asset } from "@/types";

const TABS = ["All", "Images", "Videos", "Audio", "Favorites"] as const;

export default function Assets() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [viewerAsset, setViewerAsset] = useState<Asset | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const typeFilter = tab === "Images" ? "image" : tab === "Videos" ? "video" : tab === "Audio" ? "audio" : "all";
  const { data, isLoading } = useQuery({
    queryKey: ["assets", typeFilter, tab],
    queryFn: () => listAssets({ type: typeFilter, ...(tab === "Favorites" ? { favorite: "true" } : {}) }),
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
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast("Upload complete", "success");
    },
  });

  const assets = data?.assets ?? [];

  return (
    <div {...getRootProps()} className={`max-w-[1280px] mx-auto px-4 lg:px-6 py-8 ${isDragActive ? "bg-accent/5" : ""}`}>
      <input {...getInputProps()} />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold">Assets</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => document.getElementById("asset-upload-input")?.click()} className="btn-secondary text-xs !py-1.5 !px-3 flex items-center gap-1.5">
            <Upload size={13} /> Upload
          </button>
          <div className="flex items-center bg-panel border border-border rounded-lg overflow-hidden">
            <button onClick={() => setView("grid")} className={`p-1.5 ${view === "grid" ? "bg-accent text-black" : "text-ink-muted"}`}><LayoutGrid size={14} /></button>
            <button onClick={() => setView("list")} className={`p-1.5 ${view === "list" ? "bg-accent text-black" : "text-ink-muted"}`}><List size={14} /></button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              tab === t ? "bg-accent text-black border-accent" : "bg-panel text-ink-muted border-border hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isDragActive && (
        <div className="border-2 border-dashed border-accent rounded-2xl p-10 text-center text-accent text-sm mb-6">Drop files to upload</div>
      )}

      {!isLoading && assets.length === 0 && (
        <EmptyState icon={ImageIcon} title="No assets yet" description="Generated and uploaded media will show up here." actionLabel="Create Image" actionHref="/image" />
      )}

      {view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((a) => (
            <MediaCard key={a._id} asset={a} onOpenFullscreen={() => setViewerAsset(a)} onDeleted={() => qc.invalidateQueries({ queryKey: ["assets"] })} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border divide-y divide-border">
          {assets.map((a) => (
            <div key={a._id} className="flex items-center gap-4 px-4 py-3 hover:bg-panel-secondary cursor-pointer" onClick={() => setViewerAsset(a)}>
              <img src={mediaUrl(a.thumbnailUrl || a.url)} className="w-12 h-12 rounded-lg object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{a.filename}</p>
                <p className="text-xs text-ink-muted">{formatBytes(a.size)} · {formatRelativeTime(a.createdAt)}</p>
              </div>
              <span className="badge bg-panel-secondary text-ink-muted uppercase">{a.type}</span>
            </div>
          ))}
        </div>
      )}

      <ImageViewer asset={viewerAsset} onClose={() => setViewerAsset(null)} />
      <input id="asset-upload-input" type="file" className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadAsset(file);
        qc.invalidateQueries({ queryKey: ["assets"] });
        toast("Uploaded", "success");
      }} />
    </div>
  );
}
