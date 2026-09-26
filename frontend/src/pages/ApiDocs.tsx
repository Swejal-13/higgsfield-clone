import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trash2, Code2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { listApiKeysRequest, createApiKeyRequest, revokeApiKeyRequest } from "@/api/settings";
import { apiErrorMessage } from "@/api/client";

const SECTIONS = ["Overview", "Authentication", "Models", "Image API", "Video API", "Generation API", "Webhooks", "Usage", "API Keys"];

export default function ApiDocs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [active, setActive] = useState("Overview");
  const [newKey, setNewKey] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: keys = [] } = useQuery({
    queryKey: ["api-keys"],
    queryFn: listApiKeysRequest,
    enabled: !!user && active === "API Keys",
  });

  async function generate() {
    try {
      const key = await createApiKeyRequest("Default key");
      setNewKey(key.rawKey);
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    }
  }

  async function revoke(id: string) {
    await revokeApiKeyRequest(id);
    qc.invalidateQueries({ queryKey: ["api-keys"] });
    toast("API key revoked", "info");
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-10 grid md:grid-cols-[200px_1fr] gap-8">
      <nav className="space-y-0.5">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              active === s ? "bg-accent text-white font-semibold" : "text-ink-muted hover:text-ink hover:bg-panel-secondary"
            }`}
          >
            {s}
          </button>
        ))}
      </nav>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1"><Code2 size={20} className="text-accent" /> Forge API</h1>
        <p className="text-sm text-ink-muted mb-6">Build image and video generation directly into your own product.</p>

        {active === "API Keys" ? (
          <div className="space-y-4">
            {!user ? (
              <p className="text-sm text-ink-muted">Log in to manage API keys.</p>
            ) : (
              <>
                <button onClick={generate} className="btn-primary flex items-center gap-2 text-sm">
                  <Plus size={15} /> Generate API Key
                </button>
                {newKey && (
                  <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                    <p className="text-xs text-ink-muted mb-1">Copy this now — you won't see it again:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-accent break-all">{newKey}</code>
                      <button onClick={() => { navigator.clipboard.writeText(newKey); toast("Copied", "success"); }} className="shrink-0">
                        <Copy size={14} className="text-ink-muted hover:text-ink" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="rounded-xl border border-border divide-y divide-border">
                  {keys.length === 0 && <p className="text-sm text-ink-muted p-4">No API keys yet.</p>}
                  {keys.map((k) => (
                    <div key={k._id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{k.label}</p>
                        <p className="text-xs text-ink-muted font-mono mt-0.5">{k.keyPrefix}</p>
                      </div>
                      {k.revoked ? (
                        <span className="text-xs text-red-400">Revoked</span>
                      ) : (
                        <button onClick={() => revoke(k._id)} className="text-xs text-red-400 flex items-center gap-1 hover:underline">
                          <Trash2 size={12} /> Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <DocSection title={active} />
        )}
      </div>
    </div>
  );
}

const DOC_CONTENT: Record<string, string> = {
  Overview: "The Forge API gives programmatic access to image, video and audio generation using the same models and mock pipeline that power the web app.",
  Authentication: "Authenticate requests with a Bearer token: `Authorization: Bearer <your_api_key>`. Generate a key from the API Keys tab.",
  Models: "GET /api/models — returns every enabled image, video and audio model with pricing and capabilities.",
  "Image API": "POST /api/images/generate — { prompt, model, settings } → { generation }. Also available: /edit, /inpaint, /upscale, /variation.",
  "Video API": "POST /api/videos/generate — text-to-video. POST /api/videos/image-to-video for animating a reference image. Also: /edit, /motion, /extend.",
  "Generation API": "GET /api/generations/:id/status — poll for QUEUED → PROCESSING → COMPLETED/FAILED, with progress and output assets.",
  Webhooks: "Webhook delivery is not enabled in this demo build — poll the generation status endpoint instead.",
  Usage: "GET /api/credits — current balance. GET /api/credits/transactions — full ledger of spends and refunds.",
};

function DocSection({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border bg-panel p-6">
      <h2 className="text-base font-semibold mb-2">{title}</h2>
      <p className="text-sm text-ink-muted leading-relaxed">{DOC_CONTENT[title]}</p>
    </div>
  );
}
