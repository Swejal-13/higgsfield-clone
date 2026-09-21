import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Wand2, Eraser, RotateCcw, RotateCw, Trash2 } from "lucide-react";
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
import { PillSelect } from "@/components/PillSelect";
import { mediaUrl } from "@/utils/format";
import { Asset } from "@/types";

const TOOLS = [
  { id: "inpaint", label: "Inpaint" },
  { id: "remove-object", label: "Remove Object" },
  { id: "replace-object", label: "Replace Object" },
  { id: "change-background", label: "Change Background" },
  { id: "relight", label: "Relight" },
  { id: "recolor", label: "Recolor" },
  { id: "expand", label: "Expand" },
  { id: "upscale", label: "Upscale" },
  { id: "style-transfer", label: "Style Transfer" },
] as const;

const UPSCALE_FACTORS = ["2", "4"] as const;

export default function ImageEdit() {
  const [params] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const history = useRef<ImageData[]>([]);

  const { data: models = [] } = useQuery({ queryKey: ["image-models-edit"], queryFn: () => fetchModels("image") });

  const [sourceUrl, setSourceUrl] = useState<string | undefined>(params.get("sourceUrl") || undefined);
  const [sourceAssetId, setSourceAssetId] = useState<string | undefined>(params.get("sourceAsset") || undefined);
  const [tool, setTool] = useState<(typeof TOOLS)[number]["id"]>((params.get("tool") as any) || "inpaint");
  const [modelId, setModelId] = useState("gpt-image");
  const [brushSize, setBrushSize] = useState(30);
  const [prompt, setPrompt] = useState("");
  const [upscaleFactor, setUpscaleFactor] = useState<(typeof UPSCALE_FACTORS)[number]>("2");

  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  const [result, setResult] = useState<Asset | null>(null);
  const [viewerAsset, setViewerAsset] = useState<Asset | null>(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generation = useGenerationPolling(activeGenerationId);
  const selectedModel = models.find((m) => m.id === modelId);
  const needsMask = tool === "inpaint" || tool === "remove-object" || tool === "replace-object";

  useEffect(() => {
    if (generation?.status === "COMPLETED") {
      const outputs = (generation.outputAssets as unknown as Asset[]) || [];
      setResult(outputs[0] || null);
      setActiveGenerationId(null);
      refreshUser();
      toast("Edit applied!", "success");
    } else if (generation?.status === "FAILED") {
      toast(generation.error || "Edit failed", "error");
      refreshUser();
    }
  }, [generation?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  function initCanvas() {
    const canvas = canvasRef.current;
    const wrap = imgWrapRef.current;
    if (!canvas || !wrap) return;
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.current = [];
  }

  useEffect(() => {
    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceUrl]);

  function pushHistory() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (history.current.length > 20) history.current.shift();
  }

  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.fillStyle = "rgba(223,255,0,0.5)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function clearMask() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function undo() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const prev = history.current.pop();
    if (prev) ctx.putImageData(prev, 0, 0);
    else clearMask();
  }

  async function handleApply() {
    if (!user) return toast("Please log in", "error");
    if (!sourceAssetId) return toast("Upload an image first", "error");
    if (!selectedModel) { toast("Models failed to load — check that the backend is running and reachable.", "error"); return; }
    if (selectedModel.credits > user.credits) return setCreditModalOpen(true);

    setSubmitting(true);
    try {
      const action = tool === "upscale" ? "upscale" : needsMask ? "inpaint" : "edit";
      const gen = await createGeneration({
        type: "image",
        action,
        prompt: prompt || tool,
        model: modelId,
        settings: { tool, upscaleFactor: Number(upscaleFactor) },
        inputAssets: [sourceAssetId],
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
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-8 grid lg:grid-cols-[320px_1fr] gap-6">
      <div className="space-y-5 order-2 lg:order-1">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2"><Wand2 size={17} className="text-accent" /> Edit Image</h1>
          <p className="text-xs text-ink-muted mt-1">Upload an image, paint a mask if needed, describe the change.</p>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`text-[11px] font-medium rounded-lg px-2 py-2 border transition-colors ${
                tool === t.id ? "bg-accent text-black border-accent" : "bg-panel text-ink-muted border-border hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tool === "upscale" && (
          <PillSelect label="Upscale factor" value={upscaleFactor} onChange={setUpscaleFactor} options={UPSCALE_FACTORS.map((v) => ({ value: v, label: `${v}x` }))} />
        )}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what should change"
          rows={3}
          className="input-field resize-none"
        />

        {needsMask && (
          <div>
            <p className="text-xs font-medium text-ink-muted mb-1.5">Brush size: {brushSize}px</p>
            <input type="range" min={8} max={80} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-accent" />
            <div className="flex gap-1.5 mt-2">
              <ToolBtn icon={Eraser} label="Clear" onClick={clearMask} />
              <ToolBtn icon={RotateCcw} label="Undo" onClick={undo} />
              <ToolBtn icon={RotateCw} label="Redo" onClick={() => {}} />
            </div>
          </div>
        )}

        <button
          onClick={handleApply}
          disabled={submitting || isGenerating || !sourceAssetId}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {submitting || isGenerating ? "Applying..." : `Apply — ${selectedModel?.credits ?? 0} credits`}
        </button>
      </div>

      <div className="order-1 lg:order-2">
        {!sourceUrl ? (
          <UploadBox
            onUploaded={(url, id) => { setSourceUrl(url); setSourceAssetId(id); }}
            label="Drop an image to edit or click to upload"
          />
        ) : isGenerating ? (
          <div className="rounded-2xl border border-border bg-panel"><GenerationProgress generation={generation!} /></div>
        ) : result ? (
          <div className="max-w-md mx-auto">
            <MediaCard asset={result} onOpenFullscreen={() => setViewerAsset(result)} />
            <button onClick={() => setResult(null)} className="btn-secondary w-full mt-3 text-sm flex items-center justify-center gap-2">
              <Trash2 size={14} /> Start new edit
            </button>
          </div>
        ) : (
          <div ref={imgWrapRef} className="relative rounded-2xl overflow-hidden border border-border bg-panel-secondary aspect-video">
            <img src={mediaUrl(sourceUrl)} alt="Source" className="w-full h-full object-contain" />
            {needsMask && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 cursor-crosshair touch-none"
                onPointerDown={(e) => { drawing.current = true; pushHistory(); draw(e); }}
                onPointerMove={draw}
                onPointerUp={() => (drawing.current = false)}
                onPointerLeave={() => (drawing.current = false)}
              />
            )}
          </div>
        )}
      </div>

      <ImageViewer asset={viewerAsset} onClose={() => setViewerAsset(null)} />
      <InsufficientCreditsModal open={creditModalOpen} onClose={() => setCreditModalOpen(false)} needed={selectedModel?.credits ?? 0} have={user?.credits ?? 0} />
    </div>
  );
}

function ToolBtn({ icon: Icon, label, onClick }: { icon: typeof Eraser; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 flex items-center justify-center gap-1.5 bg-panel border border-border rounded-lg px-2 py-1.5 text-xs text-ink-muted hover:text-ink transition-colors">
      <Icon size={13} /> {label}
    </button>
  );
}
