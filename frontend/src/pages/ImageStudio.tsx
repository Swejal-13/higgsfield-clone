import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
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

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"] as const;
const RESOLUTIONS = ["1K", "2K", "4K"] as const;
const QUALITIES = ["Standard", "High"] as const;
const COUNTS = ["1", "2", "4"] as const;

export default function ImageStudio() {
  const [params] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const { data: models = [], isError: modelsErrored } = useQuery({ queryKey: ["image-models"], queryFn: () => fetchModels("image") });
  const { data: effects = [] } = useQuery({ queryKey: ["all-effects-img"], queryFn: () => fetchEffects() });

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [modelId, setModelId] = useState(params.get("model") || "higgsfield-soul-2");
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIOS)[number]>("1:1");
  const [resolution, setResolution] = useState<(typeof RESOLUTIONS)[number]>("1K");
  const [quality, setQuality] = useState<(typeof QUALITIES)[number]>("Standard");
  const [numImages, setNumImages] = useState<(typeof COUNTS)[number]>("1");
  const [referenceUrl, setReferenceUrl] = useState<string | undefined>();
  const [referenceAssetId, setReferenceAssetId] = useState<string | undefined>();

  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  const [results, setResults] = useState<Asset[]>([]);
  const [viewerAsset, setViewerAsset] = useState<Asset | null>(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generation = useGenerationPolling(activeGenerationId);
  const selectedModel = models.find((m) => m.id === modelId);

  useEffect(() => {
    const effectId = params.get("effect");
    if (effectId && effects.length) {
      const effect = effects.find((e) => e.id === effectId);
      if (effect) {
        setPrompt((p) => p || `${effect.name} style scene`);
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
      toast("Image generation complete!", "success");
    } else if (generation?.status === "FAILED") {
      toast(generation.error || "Generation failed", "error");
      refreshUser();
    }
  }, [generation?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate(action: string = "generate", overridePrompt?: string) {
    if (!user) {
      toast("Please log in to generate", "error");
      return;
    }
    if (!selectedModel) { toast("Models failed to load — check that the backend is running and reachable.", "error"); return; }
    if (selectedModel.credits > user.credits) {
      setCreditModalOpen(true);
      return;
    }
    if (!prompt.trim() && !overridePrompt && action === "generate") {
      toast("Please enter a prompt", "error");
      return;
    }

    setSubmitting(true);
    try {
      const gen = await createGeneration({
        type: "image",
        action,
        prompt: overridePrompt ?? prompt,
        negativePrompt,
        model: modelId,
        settings: { aspectRatio, resolution, quality, numImages: Number(numImages) },
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
      {/* Left panel: prompt + controls */}
      <div className="space-y-5 order-2 lg:order-1">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2"><Sparkles size={17} className="text-accent" /> Create Image</h1>
          <p className="text-xs text-ink-muted mt-1">Describe what you want to see, pick a model, and generate.</p>
        </div>

        {modelsErrored && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
            Couldn't reach the backend to load models. Make sure it's running on port 5000 and try refreshing.
          </div>
        )}
        <ModelSelector models={models} value={modelId} onChange={setModelId} />

        <PromptBox
          value={prompt}
          onChange={setPrompt}
          negativeValue={negativePrompt}
          onNegativeChange={setNegativePrompt}
          showNegative
        />

        <div>
          <p className="text-xs font-medium text-ink-muted mb-1.5">Reference image (optional)</p>
          <UploadBox
            currentUrl={referenceUrl}
            onUploaded={(url, id) => { setReferenceUrl(url); setReferenceAssetId(id); }}
            onClear={() => { setReferenceUrl(undefined); setReferenceAssetId(undefined); }}
          />
        </div>

        <PillSelect label="Aspect Ratio" value={aspectRatio} onChange={setAspectRatio} options={ASPECT_RATIOS.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Resolution" value={resolution} onChange={setResolution} options={RESOLUTIONS.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Quality" value={quality} onChange={setQuality} options={QUALITIES.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Number of Images" value={numImages} onChange={setNumImages} options={COUNTS.map((v) => ({ value: v, label: v }))} />

        <button
          onClick={() => handleGenerate()}
          disabled={submitting || isGenerating}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {submitting || isGenerating ? "Generating..." : `Generate — ${selectedModel ? selectedModel.credits * Number(numImages) : 0} credits`}
        </button>
      </div>

      {/* Right panel: canvas / results */}
      <div className="order-1 lg:order-2 min-h-[400px]">
        {generation && isGenerating && (
          <div className="rounded-2xl border border-border bg-panel">
            <GenerationProgress generation={generation} />
          </div>
        )}

        {!isGenerating && results.length === 0 && (
          <div className="rounded-2xl border border-border bg-panel">
            <EmptyState
              icon={Sparkles}
              title="No generations yet"
              description="Your creations will appear here. Describe a scene on the left and hit Generate."
            />
          </div>
        )}

        {results.length > 0 && !isGenerating && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((asset) => (
              <MediaCard
                key={asset._id}
                asset={asset}
                onOpenFullscreen={() => setViewerAsset(asset)}
                onVariation={() => {
                  setReferenceAssetId(asset._id);
                  handleGenerate("variation", prompt);
                }}
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
