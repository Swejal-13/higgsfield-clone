import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, X, Sparkles, Wand2, FolderKanban, Image as ImageIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchModels } from "@/api/models";
import { fetchEffects } from "@/api/effects";
import { listProjects } from "@/api/projects";
import { useAuth } from "@/contexts/AuthContext";

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const { data: models = [] } = useQuery({ queryKey: ["search-models"], queryFn: () => fetchModels(), enabled: open });
  const { data: effects = [] } = useQuery({ queryKey: ["search-effects"], queryFn: () => fetchEffects(), enabled: open });
  const { data: projects = [] } = useQuery({
    queryKey: ["search-projects"],
    queryFn: listProjects,
    enabled: open && !!user,
  });

  const q = query.trim().toLowerCase();
  const filteredModels = useMemo(() => (q ? models.filter((m) => m.name.toLowerCase().includes(q)) : models).slice(0, 5), [models, q]);
  const filteredEffects = useMemo(() => (q ? effects.filter((e) => e.name.toLowerCase().includes(q)) : effects).slice(0, 5), [effects, q]);
  const filteredProjects = useMemo(() => (q ? projects.filter((p) => p.name.toLowerCase().includes(q)) : projects).slice(0, 5), [projects, q]);

  function go(path: string) {
    navigate(path);
    setOpen(false);
    setQuery("");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-start justify-center pt-[12vh] px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-panel border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={18} className="text-ink-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models, effects, projects, assets..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-muted"
              />
              <button onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {filteredModels.length > 0 && (
                <Section title="Models" icon={<Sparkles size={12} />}>
                  {filteredModels.map((m) => (
                    <Row key={m.id} label={m.name} sub={m.description} onClick={() => go(`/${m.type}?model=${m.id}`)} />
                  ))}
                </Section>
              )}
              {filteredEffects.length > 0 && (
                <Section title="Effects" icon={<Wand2 size={12} />}>
                  {filteredEffects.map((e) => (
                    <Row key={e.id} label={e.name} sub={e.category} onClick={() => go(`/effects?effect=${e.id}`)} />
                  ))}
                </Section>
              )}
              {user && filteredProjects.length > 0 && (
                <Section title="Projects" icon={<FolderKanban size={12} />}>
                  {filteredProjects.map((p) => (
                    <Row key={p._id} label={p.name} sub={p.description || "Project"} onClick={() => go(`/projects/${p._id}`)} />
                  ))}
                </Section>
              )}
              {filteredModels.length === 0 && filteredEffects.length === 0 && filteredProjects.length === 0 && (
                <div className="text-center py-10 text-ink-muted text-sm flex flex-col items-center gap-2">
                  <ImageIcon size={20} />
                  No results for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-3 py-2 rounded-lg hover:bg-panel-secondary transition-colors flex flex-col">
      <span className="text-sm text-ink">{label}</span>
      <span className="text-xs text-ink-muted">{sub}</span>
    </button>
  );
}
