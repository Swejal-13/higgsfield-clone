import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, Scissors } from "lucide-react";
import { fetchModels } from "@/api/models";
import { createGeneration } from "@/api/generations";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/api/client";
import { UploadBox } from "@/components/UploadBox";
import { GenerationProgress } from "@/components/GenerationProgress";
import { MediaCard } from "@/components/MediaCard";
import { ImageViewer } from "@/components/ImageViewer";
import { InsufficientCreditsModal } from "@/components/InsufficientCreditsModal";
import { mediaUrl } from "@/utils/format";
import { Asset } from "@/types";

const TOOLS = [
  "Change Style", "Remove Object", "Replace Object", "Change Background", "Add Motion",
  "Extend Video", "Generate Ending", "Generate Opening", "Upscale", "Add Audio",
];

export default function VideoEdit() {
  const [params] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: models = [] } = useQuery({ queryKey: ["video-models-edit"], queryFn: () => fetchModels("video") });

  const [sourceUrl, setSourceUrl] = useState<string | undefined>(params.get("sourceUrl") || undefined);
  const [sourceAssetId, setSourceAssetId] = useState<string | undefined>(params.get("sourceAsset") || undefined);
  const [tool, setTool] = useState(TOOLS[0]);
  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState(models[0]?.id || "seedance-2-5");
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  const [result, setResult] = useState<Asset | null>(null);
  const [viewerAsset, setViewerAsset] = useState<Asset | null>(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generation = useGenerationPolling(activeGenerationId);
  const selectedModel = models.find((m) => m.id === modelId) || models[0];
  const isGenerating = !!generation && !["COMPLETED", "FAILED", "CANCELLED"].includes(generation.status);

  useEffect(() => {
    if (generation?.status === "COMPLETED") {
      const outputs = (generation.outputAssets as unknown as Asset[]) || [];
      setResult(outputs[0] || null);
      setActiveGenerationId(null);
      refreshUser();
      toast("Video edit applied!", "success");
    } else if (generation?.status === "FAILED") {
      toast(generation.error || "Edit failed", "error");
      refreshUser();
    }
  }, [generation?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  }

  async function handleApply() {
    if (!user) return toast("Please log in", "error");
    if (!sourceAssetId) return toast("Upload a video first", "error");
    if (!selectedModel) { toast("Models failed to load — check that the backend is running and reachable.", "error"); return; }
    if (selectedModel.credits > user.credits) return setCreditModalOpen(true);

    setSubmitting(true);
    try {
      const action = tool === "Extend Video" ? "extend" : "edit";
      const gen = await createGeneration({
        type: "video",
        action,
        prompt: prompt || tool,
        model: selectedModel.id,
        settings: { tool },
        inputAssets: [sourceAssetId],
      });
      setActiveGenerationId(gen._id);
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-8 grid lg:grid-cols-[320px_1fr] gap-6">
      <div className="space-y-5 order-2 lg:order-1">
        <h1 className="text-lg font-bold flex items-center gap-2"><Scissors size={17} className="text-accent" /> Edit Video</h1>
        <div className="grid grid-cols-2 gap-1.5">
          {TOOLS.map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`text-[11px] font-medium rounded-lg px-2 py-2 border transition-colors ${
                tool === t ? "bg-accent text-white border-accent" : "bg-panel text-ink-muted border-border hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the edit" rows={3} className="input-field resize-none" />
        <button onClick={handleApply} disabled={submitting || isGenerating || !sourceAssetId} className="btn-primary w-full">
          {submitting || isGenerating ? "Applying..." : `Apply — ${selectedModel?.credits ?? 0} credits`}
        </button>
      </div>

      <div className="order-1 lg:order-2">
        {!sourceUrl ? (
          <UploadBox
            accept={{ "video/mp4": [] }}
            onUploaded={(url, id) => { setSourceUrl(url); setSourceAssetId(id); }}
            label="Drop a video to edit or click to upload"
          />
        ) : isGenerating ? (
          <div className="rounded-2xl border border-border bg-panel"><GenerationProgress generation={generation!} /></div>
        ) : result ? (
          <MediaCard asset={result} onOpenFullscreen={() => setViewerAsset(result)} />
        ) : (
          <div className="rounded-2xl border border-border bg-panel overflow-hidden">
            <video
              ref={videoRef}
              src={mediaUrl(sourceUrl)}
              className="w-full aspect-video bg-black"
              onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />
            <div className="p-3 flex items-center gap-3">
              <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={current}
                onChange={(e) => { if (videoRef.current) videoRef.current.currentTime = Number(e.target.value); }}
                className="flex-1 accent-accent"
              />
              <span className="text-xs text-ink-muted font-mono w-20 text-right">
                {current.toFixed(1)}s / {duration.toFixed(1)}s
              </span>
            </div>
          </div>
        )}
      </div>

      <ImageViewer asset={viewerAsset} onClose={() => setViewerAsset(null)} />
      <InsufficientCreditsModal open={creditModalOpen} onClose={() => setCreditModalOpen(false)} needed={selectedModel?.credits ?? 0} have={user?.credits ?? 0} />
    </div>
  );
}
