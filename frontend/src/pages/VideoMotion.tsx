import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PersonStanding } from "lucide-react";
import { fetchModels } from "@/api/models";
import { createGeneration } from "@/api/generations";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/api/client";
import { UploadBox } from "@/components/UploadBox";
import { PillSelect } from "@/components/PillSelect";
import { GenerationProgress } from "@/components/GenerationProgress";
import { MediaCard } from "@/components/MediaCard";
import { ImageViewer } from "@/components/ImageViewer";
import { InsufficientCreditsModal } from "@/components/InsufficientCreditsModal";
import { EmptyState } from "@/components/EmptyState";
import { Asset } from "@/types";

const QUALITIES = ["Standard", "High"] as const;
const BACKGROUNDS = ["Keep Original", "Studio", "Transparent", "Custom"] as const;
const STRENGTHS = ["Low", "Medium", "High"] as const;

export default function VideoMotion() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { data: models = [] } = useQuery({ queryKey: ["motion-models"], queryFn: () => fetchModels("video") });

  const [characterUrl, setCharacterUrl] = useState<string>();
  const [characterId, setCharacterId] = useState<string>();
  const [motionUrl, setMotionUrl] = useState<string>();
  const [motionId, setMotionId] = useState<string>();
  const [modelId, setModelId] = useState("kling-motion-control");
  const [quality, setQuality] = useState<(typeof QUALITIES)[number]>("Standard");
  const [background, setBackground] = useState<(typeof BACKGROUNDS)[number]>("Keep Original");
  const [strength, setStrength] = useState<(typeof STRENGTHS)[number]>("Medium");

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
      toast("Motion control generation complete!", "success");
    } else if (generation?.status === "FAILED") {
      toast(generation.error || "Generation failed", "error");
      refreshUser();
    }
  }, [generation?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate() {
    if (!user) return toast("Please log in", "error");
    if (!characterId || !motionId) return toast("Upload both a character image and a motion reference video", "error");
    if (!selectedModel) { toast("Models failed to load — check that the backend is running and reachable.", "error"); return; }
    if (selectedModel.credits > user.credits) return setCreditModalOpen(true);

    setSubmitting(true);
    try {
      const gen = await createGeneration({
        type: "video",
        action: "motion-control",
        prompt: "Motion control transfer",
        model: modelId,
        settings: { quality, background, strength },
        inputAssets: [characterId, motionId],
      });
      setActiveGenerationId(gen._id);
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-8 grid lg:grid-cols-[340px_1fr] gap-6">
      <div className="space-y-5 order-2 lg:order-1">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2"><PersonStanding size={17} className="text-accent" /> Motion Control</h1>
          <p className="text-xs text-ink-muted mt-1">Drive a character image using a reference motion clip.</p>
        </div>

        <div>
          <p className="text-xs font-medium text-ink-muted mb-1.5">Character image</p>
          <UploadBox currentUrl={characterUrl} onUploaded={(u, id) => { setCharacterUrl(u); setCharacterId(id); }} onClear={() => { setCharacterUrl(undefined); setCharacterId(undefined); }} />
        </div>

        <div>
          <p className="text-xs font-medium text-ink-muted mb-1.5">Motion reference video</p>
          <UploadBox
            accept={{ "video/mp4": [] }}
            currentUrl={motionUrl}
            onUploaded={(u, id) => { setMotionUrl(u); setMotionId(id); }}
            onClear={() => { setMotionUrl(undefined); setMotionId(undefined); }}
          />
        </div>

        <PillSelect label="Quality" value={quality} onChange={setQuality} options={QUALITIES.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Background" value={background} onChange={setBackground} options={BACKGROUNDS.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Motion strength" value={strength} onChange={setStrength} options={STRENGTHS.map((v) => ({ value: v, label: v }))} />

        <button onClick={handleGenerate} disabled={submitting || isGenerating} className="btn-primary w-full">
          {submitting || isGenerating ? "Generating..." : `Generate Motion — ${selectedModel?.credits ?? 0} credits`}
        </button>
      </div>

      <div className="order-1 lg:order-2 min-h-[400px]">
        {isGenerating ? (
          <div className="rounded-2xl border border-border bg-panel"><GenerationProgress generation={generation!} /></div>
        ) : result ? (
          <div className="max-w-md mx-auto">
            <MediaCard asset={result} onOpenFullscreen={() => setViewerAsset(result)} />
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-panel">
            <EmptyState icon={PersonStanding} title="No motion results yet" description="Upload a character and a motion reference, then generate." />
          </div>
        )}
      </div>

      <ImageViewer asset={viewerAsset} onClose={() => setViewerAsset(null)} />
      <InsufficientCreditsModal open={creditModalOpen} onClose={() => setCreditModalOpen(false)} needed={selectedModel?.credits ?? 0} have={user?.credits ?? 0} />
    </div>
  );
}
