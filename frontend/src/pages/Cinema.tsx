import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clapperboard } from "lucide-react";
import { fetchModels } from "@/api/models";
import { createGeneration } from "@/api/generations";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/api/client";
import { PillSelect } from "@/components/PillSelect";
import { GenerationProgress } from "@/components/GenerationProgress";
import { MediaCard } from "@/components/MediaCard";
import { ImageViewer } from "@/components/ImageViewer";
import { InsufficientCreditsModal } from "@/components/InsufficientCreditsModal";
import { EmptyState } from "@/components/EmptyState";
import { Asset } from "@/types";

const CAMERA = ["Pan", "Tilt", "Dolly", "Truck", "Orbit", "Zoom", "Crane", "Handheld", "Tracking"] as const;
const LENS = ["24mm", "35mm", "50mm", "85mm", "135mm"] as const;
const LIGHTING = ["Natural", "Studio", "Cinematic", "Low Key", "Neon", "Golden Hour"] as const;

export default function Cinema() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { data: models = [] } = useQuery({ queryKey: ["cinema-models"], queryFn: () => fetchModels("video") });
  const model = models.find((m) => m.id === "seedance-2-5") || models[0];

  const [scene, setScene] = useState("");
  const [character, setCharacter] = useState("");
  const [environment, setEnvironment] = useState("");
  const [camera, setCamera] = useState<(typeof CAMERA)[number]>("Dolly");
  const [lens, setLens] = useState<(typeof LENS)[number]>("35mm");
  const [lighting, setLighting] = useState<(typeof LIGHTING)[number]>("Cinematic");

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
      toast("Scene rendered!", "success");
    } else if (generation?.status === "FAILED") {
      toast(generation.error || "Render failed", "error");
      refreshUser();
    }
  }, [generation?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  function buildPrompt() {
    const parts = [scene, character && `featuring ${character}`, environment && `in ${environment}`].filter(Boolean);
    return parts.join(", ") || "A cinematic scene";
  }

  async function handleGenerate() {
    if (!user) return toast("Please log in", "error");
    if (!scene.trim()) return toast("Describe the scene first", "error");
    if (!model) { toast("Models failed to load — check that the backend is running and reachable.", "error"); return; }
    if (model.credits > user.credits) return setCreditModalOpen(true);

    setSubmitting(true);
    try {
      const gen = await createGeneration({
        type: "video",
        action: "generate",
        prompt: buildPrompt(),
        model: model.id,
        settings: { camera, lens, lighting, source: "cinema-studio" },
      });
      setActiveGenerationId(gen._id);
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-8 grid lg:grid-cols-[380px_1fr] gap-6">
      <div className="space-y-5 order-2 lg:order-1">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2"><Clapperboard size={17} className="text-accent" /> Cinema Studio</h1>
          <p className="text-xs text-ink-muted mt-1">Direct every element of your shot like a real production.</p>
        </div>

        <Field label="Scene"><textarea value={scene} onChange={(e) => setScene(e.target.value)} rows={2} className="input-field resize-none" placeholder="A rain-soaked alley at midnight" /></Field>
        <Field label="Character"><input value={character} onChange={(e) => setCharacter(e.target.value)} className="input-field" placeholder="A detective in a trench coat" /></Field>
        <Field label="Environment"><input value={environment} onChange={(e) => setEnvironment(e.target.value)} className="input-field" placeholder="Neon-lit downtown district" /></Field>

        <PillSelect label="Camera Movement" value={camera} onChange={setCamera} options={CAMERA.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Lens" value={lens} onChange={setLens} options={LENS.map((v) => ({ value: v, label: v }))} />
        <PillSelect label="Lighting" value={lighting} onChange={setLighting} options={LIGHTING.map((v) => ({ value: v, label: v }))} />

        <button onClick={handleGenerate} disabled={submitting || isGenerating} className="btn-primary w-full">
          {submitting || isGenerating ? "Rendering..." : `Generate Scene — ${model?.credits ?? 0} credits`}
        </button>
      </div>

      <div className="order-1 lg:order-2 min-h-[400px]">
        {isGenerating ? (
          <div className="rounded-2xl border border-border bg-panel"><GenerationProgress generation={generation!} /></div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-border bg-panel">
            <EmptyState icon={Clapperboard} title="No scenes rendered yet" description="Set your scene, camera and lighting, then render." />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {results.map((a) => <MediaCard key={a._id} asset={a} onOpenFullscreen={() => setViewerAsset(a)} />)}
          </div>
        )}
      </div>

      <ImageViewer asset={viewerAsset} onClose={() => setViewerAsset(null)} />
      <InsufficientCreditsModal open={creditModalOpen} onClose={() => setCreditModalOpen(false)} needed={model?.credits ?? 0} have={user?.credits ?? 0} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-muted mb-1.5">{label}</p>
      {children}
    </div>
  );
}
