import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Film, Volume2, VolumeX } from "lucide-react";
import { fetchModels } from "@/api/models";
import { fetchEffects } from "@/api/effects";
import { createGeneration } from "@/api/generations";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/api/client";
import { PromptBox } from "@/components/PromptBox";
import { ModelSelector } from "@/components/ModelSelector";
import { PillSelect } from "@/components/PillSelect";
import { UploadBox } from "@/components/UploadBox";
import { GenerationProgress } from "@/components/GenerationProgress";
import { MediaCard } from "@/components/MediaCard";
import { ImageViewer } from "@/components/ImageViewer";
import { InsufficientCreditsModal } from "@/components/InsufficientCreditsModal";
import { EmptyState } from "@/components/EmptyState";
import { Asset } from "@/types";

const DURATIONS = ["5", "8", "10", "15", "30"] as const;
const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3"] as const;
const RESOLUTIONS = ["1K", "2K", "4K"] as const;
const QUALITIES = ["Standard", "High"] as const;
const MOTIONS = ["Subtle", "Medium", "Dynamic"] as const;
const CAMERAS = ["Static", "Pan", "Dolly In", "Orbit", "Handheld"] as const;

export default function VideoStudio() {
  const [params] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const { data: models = [], isError: modelsErrored } = useQuery({ queryKey: ["video-models"], queryFn: () => fetchModels("video") });
  const { data: effects = [] } = useQuery({ queryKey: ["all-effects-vid"], queryFn: () => fetchEffects() });

  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState(params.get("model") || "seedance-2-5");
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>("5");
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIOS)[number]>("16:9");
  const [resolution, setResolution] = useState<(typeof RESOLUTIONS)[number]>("1K");
  const [quality, setQuality] = useState<(typeof QUALITIES)[number]>("Standard");
  const [motion, setMotion] = useState<(typeof MOTIONS)[number]>("Medium");
  const [camera, setCamera] = useState<(typeof CAMERAS)[number]>("Static");
  const [audioOn, setAudioOn] = useState(true);
  const [referenceUrl, setReferenceUrl] = useState<string | undefined>(params.get("sourceUrl") || undefined);
  const [referenceAssetId, setReferenceAssetId] = useState<string | undefined>(params.get("sourceAsset") || undefined);

  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  const [results, setResults] = useState<Asset[]>([]);
  const [viewerAsset, setViewerAsset] = useState<Asset | null>(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generation = useGenerationPolling(activeGenerationId);
  const selectedModel = models.find((m) => m.id === modelId);
  const hasReference = !!referenceAssetId;

  useEffect(() => {
    if (params.get("sourceAsset")) {
      toast("Reference image loaded from Image Studio", "success");
    }
    const effectId = params.get("effect");
    if (effectId && effects.length) {
      const effect = effects.find((e) => e.id === effectId);
      if (effect) {
        setPrompt((p) => p || `${effect.name} style scene`);
        if (effect.preset.camera) setCamera(String(effect.preset.camera).replace("-", " ") as any);
        toast(`Loaded "${effect.name}" preset`, "info");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effects]);

  useEffect(() => {
    if (generation?.status === "COMPLETED") {
      const outputs = (generation.outputAssets as unknown as Asset[]) || [];
      setResults((prev) => [...outputs, ...prev]);
      setActiveGenerationId(null);
      refreshUser();
      toast("Video generation complete!", "success");
    } else if (generation?.status === "FAILED") {
      toast(generation.error || "Generation failed", "error");
      refreshUser();
    }
  }, [generation?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate() {
  if (!selectedModel) {
    toast("Models failed to load — check that the backend is running and reachable.", "error");
    return;
  }

  const availableCredits = user?.credits ?? 240;

  if (selectedModel.credits > availableCredits) {
    setCreditModalOpen(true);
    return;
  }
    if (!prompt.trim() && !hasReference) {
      toast("Please enter a prompt or attach a reference image", "error");
      return;
    }

    setSubmitting(true);
    try {
      const gen = await createGeneration({
        type: "video",
        action: hasReference ? "image-to-video" : "generate",
        prompt,
        model: modelId,
        settings: { duration: Number(duration), aspectRatio, resolution, quality, motion, camera, audio: audioOn },
        inputAssets: referenceAssetId ? [referenceAssetId] : [],
      });
      setActiveGenerationId(gen._id);
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  const isGenerating = !!generation && generation.status !== "COMPLETED" && generation.status !== "FAILED" && generation.status !== "CANCELLED";

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-8 grid lg:grid-cols-[360px_1fr] gap-6">
      <div className="space-y-5 order-2 lg:order-1">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2"><Film size={17} className="text-accent" /> Create Video</h1>
          <p className="text-xs text-ink-muted mt-1">
            {hasReference ? "Animating your reference image." : "Text-to-video or attach a reference image below."}
          </p>
        </div>

        {modelsErrored && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
            Couldn't reach the backend to load models. Make sure it's running on port 5000 and try refreshing.
          </div>
        )}
        <ModelSelector models={models} value={modelId} onChange={setModelId} />

        <PromptBox value={prompt} onChange={setPrompt} placeholder="Describe the motion and scene you imagine" />

        <div>
          <p className="text-xs font-medium text-ink-muted mb-1.5">Reference image (image-to-video)</p>
          <UploadBox
            accept={{ "image/png": [], "image/jpeg": [], "image/webp": [] }}
            currentUrl={referenceUrl}
            onUploaded={(url, id) => { setReferenceUrl(url); setReferenceAssetId(id); }}
            onClear={() => { setReferenceUrl(undefined); setReferenceAssetId(undefined); }}
          />
        </div>

        <PillSelect label="Duration" value={duration} onChange={setDuration} options={DURATIONS.map((v) => ({ value: v, label: `${v}s` }))} />
        <PillSelect label="Aspect Ratio" value={aspectRatio} onChange={setAspectRatio} options={ASPECT_RATIOS.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Resolution" value={resolution} onChange={setResolution} options={RESOLUTIONS.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Quality" value={quality} onChange={setQuality} options={QUALITIES.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Motion" value={motion} onChange={setMotion} options={MOTIONS.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Camera" value={camera} onChange={setCamera} options={CAMERAS.map((v) => ({ value: v, label: v }))} />

        <button
          onClick={() => setAudioOn((a) => !a)}
          className="w-full flex items-center justify-between bg-panel border border-border rounded-xl px-3 py-2.5 text-sm"
        >
          <span className="flex items-center gap-2 text-ink-muted">{audioOn ? <Volume2 size={15} /> : <VolumeX size={15} />} Audio</span>
          <span className={`text-xs font-semibold ${audioOn ? "text-accent" : "text-ink-muted"}`}>{audioOn ? "On" : "Off"}</span>
        </button>

        <button
          onClick={handleGenerate}
          disabled={submitting || isGenerating}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {submitting || isGenerating ? "Generating..." : `Generate Video — ${selectedModel?.credits ?? 0} credits`}
        </button>
      </div>

      <div className="order-1 lg:order-2 min-h-[400px]">
        {generation && isGenerating && (
          <div className="rounded-2xl border border-border bg-panel">
            <GenerationProgress generation={generation} />
          </div>
        )}

        {!isGenerating && results.length === 0 && (
          <div className="rounded-2xl border border-border bg-panel">
            <EmptyState icon={Film} title="No videos yet" description="Your generated videos will appear here." />
          </div>
        )}

        {results.length > 0 && !isGenerating && (
          <div className="grid grid-cols-2 gap-4">
            {results.map((asset) => (
              <MediaCard
                key={asset._id}
                asset={asset}
                onOpenFullscreen={() => setViewerAsset(asset)}
                onDeleted={() => setResults((prev) => prev.filter((a) => a._id !== asset._id))}
              />
            ))}
          </div>
        )}
      </div>

      <ImageViewer asset={viewerAsset} onClose={() => setViewerAsset(null)} />
      <InsufficientCreditsModal
        open={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        needed={selectedModel?.credits ?? 0}
        have={user?.credits ?? 0}
      />
    </div>
  );
}
