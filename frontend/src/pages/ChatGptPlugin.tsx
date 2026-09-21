import { useState } from "react";
import { MessageSquare, Check, Image as ImageIcon, Film, Wand2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

const FEATURES = [
  { icon: Wand2, label: "Generate", desc: "Trigger Higgsfield generations from a ChatGPT conversation." },
  { icon: ImageIcon, label: "Create images", desc: "Produce on-brand images without leaving chat." },
  { icon: Film, label: "Create videos", desc: "Turn a described scene into a short video clip." },
  { icon: Wand2, label: "Edit", desc: "Inpaint, upscale or restyle an existing image." },
];

export default function ChatGptPlugin() {
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  return (
    <div className="max-w-[800px] mx-auto px-4 py-16 text-center">
      <div className="inline-flex w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mb-4">
        <MessageSquare size={22} className="text-accent" />
      </div>
      <h1 className="text-3xl font-extrabold">Higgsfield ChatGPT Plugin</h1>
      <p className="text-sm text-ink-muted mt-3 max-w-md mx-auto">
        Bring Higgsfield's image and video generation directly into your ChatGPT conversations.
      </p>
      <button
        onClick={() => { setConnected(true); toast("Connected to ChatGPT (demo)", "success"); }}
        disabled={connected}
        className="btn-primary mt-8 inline-flex items-center gap-2"
      >
        {connected ? <><Check size={16} /> Connected</> : "Connect"}
      </button>

      <div className="grid grid-cols-2 gap-4 mt-14 text-left">
        {FEATURES.map((f) => (
          <div key={f.label} className="rounded-2xl border border-border bg-panel p-5">
            <f.icon size={18} className="text-accent mb-2" />
            <p className="text-sm font-semibold">{f.label}</p>
            <p className="text-xs text-ink-muted mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
