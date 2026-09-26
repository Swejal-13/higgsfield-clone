import { useEffect, useState } from "react";
import { Wand2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import { EmptyState } from "@/components/EmptyState";
import { Asset } from "@/types";

const STYLES = ["Anime", "Cyberpunk", "Watercolor", "Claymation", "Cinematic Noir", "3D Render"];

export default function Genjutsu() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { data: models = [] } = useQuery({ queryKey: ["genjutsu-models"], queryFn: () => fetchModels("video") });
  const model = models.find((m) => m.id === "forge-genjutsu") || models[0];

  const [sourceUrl, setSourceUrl] = useState<string>();
  const [sourceId, setSourceId] = useState<string>();
  const [style, setStyle] = useState(STYLES[0]);
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  const [results, setResults] = useState<Asset[]>([]);
  const [viewerAsset, setViewerAsset] = useState<Asset | null>(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generation = useGenerationPolling(activeGenerationId);
  const isGenerating = !!generation && !["COMPLETED", "FAILED", "CANCELLED"].includes(generation.status);

  useEffect(() => {
    if (generation?.status === "COMPLETED") {
      const outputs = (generation.outputAssets as unknown as Asset[]) || [];
      setResults((prev) => [...outputs, ...prev]);
      setActiveGenerationId(null);
      refreshUser();
      toast("New visions generated!", "success");
    } else if (generation?.status === "FAILED") {
      toast(generation.error || "Generation failed", "error");
      refreshUser();
    }
  }, [generation?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate() {
    if (!user) return toast("Please log in", "error");
    if (!sourceId) return toast("Upload a reference image or video first", "error");
    if (!model) { toast("Models failed to load — check that the backend is running and reachable.", "error"); return; }
    if (model.credits > user.credits) return setCreditModalOpen(true);

    setSubmitting(true);
    try {
      const gen = await createGeneration({
        type: "video",
        action: "video-to-video",
        prompt: `Reimagine in ${style} style`,
        model: model.id,
        settings: { style },
        inputAssets: [sourceId],
      });
      setActiveGenerationId(gen._id);
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-12 text-center">
      <div className="inline-flex w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mb-4">
        <Wand2 size={22} className="text-accent" />
      </div>
      <h1 className="text-3xl font-extrabold">Genjutsu</h1>
      <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">One upload in. Endless new visions out.</p>

      <div className="grid md:grid-cols-2 gap-6 mt-10 text-left">
        <div className="space-y-4">
          <UploadBox
            accept={{ "image/png": [], "image/jpeg": [], "video/mp4": [] }}
            currentUrl={sourceUrl}
            onUploaded={(u, id) => { setSourceUrl(u); setSourceId(id); }}
            onClear={() => { setSourceUrl(undefined); setSourceId(undefined); }}
            label="Drop a reference image or video"
          />
          <div>
            <p className="text-xs font-medium text-ink-muted mb-1.5">Transformation style</p>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    style === s ? "bg-accent text-white border-accent" : "bg-panel text-ink-muted border-border hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={submitting || isGenerating} className="btn-primary w-full">
            {submitting || isGenerating ? "Generating..." : `Generate Variations — ${model?.credits ?? 0} credits`}
          </button>
        </div>

        <div>
          {isGenerating ? (
            <div className="rounded-2xl border border-border bg-panel h-full"><GenerationProgress generation={generation!} /></div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-border bg-panel h-full flex items-center">
              <EmptyState icon={Wand2} title="No visions yet" description="Upload something and generate your first transformation." />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {results.map((a) => <MediaCard key={a._id} asset={a} onOpenFullscreen={() => setViewerAsset(a)} />)}
            </div>
          )}
        </div>
      </div>

      <ImageViewer asset={viewerAsset} onClose={() => setViewerAsset(null)} />
      <InsufficientCreditsModal open={creditModalOpen} onClose={() => setCreditModalOpen(false)} needed={model?.credits ?? 0} have={user?.credits ?? 0} />
    </div>
  );
}
