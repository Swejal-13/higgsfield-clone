import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, Plus, X } from "lucide-react";
import { listProjects, createProjectRequest } from "@/api/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/api/client";

export default function Projects() {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({ queryKey: ["projects"], queryFn: listProjects });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProjectRequest(name, description);
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast("Project created", "success");
      setModalOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2"><FolderKanban size={19} className="text-accent" /> Projects</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus size={15} /> Project
        </button>
      </div>

      {!isLoading && projects.length === 0 && (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Group your images, videos and prompts into a project to keep work organized." />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center px-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-panel border border-border rounded-2xl p-6 max-w-sm w-full relative">
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-ink-muted hover:text-ink"><X size={16} /></button>
              <h3 className="text-base font-semibold mb-4">New project</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" className="input-field" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className="input-field resize-none" />
                <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? "Creating..." : "Create project"}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
