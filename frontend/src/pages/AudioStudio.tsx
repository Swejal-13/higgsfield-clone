import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic, Music, AudioWaveform, Volume2 } from "lucide-react";
import { fetchModels } from "@/api/models";
import { createGeneration } from "@/api/generations";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/api/client";
import { PillSelect } from "@/components/PillSelect";
import { GenerationProgress } from "@/components/GenerationProgress";
import { InsufficientCreditsModal } from "@/components/InsufficientCreditsModal";
import { mediaUrl } from "@/utils/format";
import { Asset } from "@/types";

const MODES = [
  { id: "tts", label: "Text to Speech", icon: Mic },
  { id: "voice", label: "Voice", icon: Volume2 },
  { id: "sfx", label: "Sound Effects", icon: AudioWaveform },
  { id: "music", label: "Music", icon: Music },
] as const;

const VOICES = ["Aria", "Milo", "Nova", "Rex", "Sage"] as const;
const LANGUAGES = ["English", "Spanish", "French", "Hindi", "Japanese"] as const;
const DURATIONS = ["5", "10", "15", "30"] as const;
const STYLES = ["Neutral", "Energetic", "Calm", "Dramatic"] as const;

export default function AudioStudio() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { data: models = [] } = useQuery({ queryKey: ["audio-models"], queryFn: () => fetchModels("audio") });

  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("tts");
  const [prompt, setPrompt] = useState("");
  const [voice, setVoice] = useState<(typeof VOICES)[number]>("Aria");
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("English");
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>("10");
  const [style, setStyle] = useState<(typeof STYLES)[number]>("Neutral");
  const [modelId, setModelId] = useState<string>();

  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  const [result, setResult] = useState<Asset | null>(null);
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
      toast("Audio generation complete!", "success");
    } else if (generation?.status === "FAILED") {
      toast(generation.error || "Generation failed", "error");
      refreshUser();
    }
  }, [generation?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate() {
    if (!user) return toast("Please log in", "error");
    if (!prompt.trim()) return toast("Please enter a prompt", "error");
    if (!selectedModel) { toast("Models failed to load — check that the backend is running and reachable.", "error"); return; }
    if (selectedModel.credits > user.credits) return setCreditModalOpen(true);

    setSubmitting(true);
    try {
      const gen = await createGeneration({
        type: "audio",
        action: "generate",
        prompt,
        model: selectedModel.id,
        settings: { mode, voice, language, duration: Number(duration), style },
      });
      setActiveGenerationId(gen._id);
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[760px] mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Audio Studio</h1>
        <p className="text-sm text-ink-muted mt-1">Generate speech, sound effects, or original music.</p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-colors ${
              mode === m.id ? "bg-accent text-black border-accent" : "bg-panel border-border text-ink-muted hover:text-ink"
            }`}
          >
            <m.icon size={16} />
            <span className="text-[11px] font-medium">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-panel p-5 space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={mode === "tts" ? "Enter the text to speak..." : mode === "music" ? "Describe the music you want..." : "Describe the sound..."}
          rows={4}
          className="input-field resize-none"
        />

        <div className="grid grid-cols-2 gap-4">
          {(mode === "tts" || mode === "voice") && (
            <PillSelect label="Voice" value={voice} onChange={setVoice} options={VOICES.map((v) => ({ value: v, label: v }))} />
          )}
          {(mode === "tts" || mode === "voice") && (
            <PillSelect label="Language" value={language} onChange={setLanguage} options={LANGUAGES.map((v) => ({ value: v, label: v }))} />
          )}
          <PillSelect label="Duration" value={duration} onChange={setDuration} options={DURATIONS.map((v) => ({ value: v, label: `${v}s` }))} />
          <PillSelect label="Style" value={style} onChange={setStyle} options={STYLES.map((v) => ({ value: v, label: v }))} />
        </div>

        <button onClick={handleGenerate} disabled={submitting || isGenerating} className="btn-primary w-full">
          {submitting || isGenerating ? "Generating..." : `Generate Audio — ${selectedModel?.credits ?? 0} credits`}
        </button>
      </div>

      <div className="mt-6">
        {isGenerating && <div className="rounded-2xl border border-border bg-panel"><GenerationProgress generation={generation!} /></div>}
        {result && !isGenerating && (
          <div className="rounded-2xl border border-border bg-panel p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Music size={20} className="text-accent" />
            </div>
            <audio src={mediaUrl(result.url)} controls className="flex-1" />
            <a href={mediaUrl(result.url)} download={result.filename} className="btn-secondary text-xs !py-1.5 !px-3">Download</a>
          </div>
        )}
      </div>

      <InsufficientCreditsModal open={creditModalOpen} onClose={() => setCreditModalOpen(false)} needed={selectedModel?.credits ?? 0} have={user?.credits ?? 0} />
    </div>
  );
}
