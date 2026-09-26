import { useState } from "react";
import { Workflow, Check, Terminal } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

const USE_CASES = [
  { title: "Generate from your IDE", desc: "Call Forge's image and video models directly from Claude, Cursor or any MCP-compatible client." },
  { title: "Automate creative pipelines", desc: "Chain prompt → generation → asset storage inside your own agent workflows." },
  { title: "Query your library", desc: "Search past generations, assets and projects programmatically." },
];

export default function Mcp() {
  const [installed, setInstalled] = useState(false);
  const { toast } = useToast();

  return (
    <div className="max-w-[900px] mx-auto px-4 py-16 text-center">
      <div className="inline-flex w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mb-4">
        <Workflow size={22} className="text-accent" />
      </div>
      <h1 className="text-3xl font-extrabold">Forge MCP</h1>
      <p className="text-sm text-ink-muted mt-3 max-w-lg mx-auto">
        The Forge creative engine, available as a Model Context Protocol server — plug image and video
        generation directly into your favorite AI tools.
      </p>
      <button
        onClick={() => { setInstalled(true); toast("MCP server connected (demo)", "success"); }}
        disabled={installed}
        className="btn-primary mt-8 inline-flex items-center gap-2"
      >
        {installed ? <><Check size={16} /> Installed</> : "Install Forge MCP"}
      </button>

      <div className="mt-6 max-w-md mx-auto bg-panel border border-border rounded-xl p-4 text-left">
        <div className="flex items-center gap-2 text-xs text-ink-muted mb-2"><Terminal size={13} /> Config example</div>
        <pre className="text-xs text-ink font-mono overflow-x-auto">{`{
  "mcpServers": {
    "forge": {
      "command": "npx",
      "args": ["-y", "@forge/mcp-server"]
    }
  }
}`}</pre>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-14 text-left">
        {USE_CASES.map((u) => (
          <div key={u.title} className="rounded-2xl border border-border bg-panel p-5">
            <p className="text-sm font-semibold">{u.title}</p>
            <p className="text-xs text-ink-muted mt-1.5">{u.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
