import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Image as ImageIcon, Film, Sparkles } from "lucide-react";
import { fetchModels } from "@/api/models";
import { fetchEffects } from "@/api/effects";
import { ModelCard } from "@/components/ModelCard";
import { EffectCard } from "@/components/EffectCard";

export default function Landing() {
  const { data: models = [] } = useQuery({ queryKey: ["landing-models"], queryFn: () => fetchModels() });
  const { data: effects = [] } = useQuery({ queryKey: ["landing-effects"], queryFn: () => fetchEffects() });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(223,255,0,0.10),transparent_45%)]" />
        <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-28 text-center relative">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs font-semibold text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-6"
          >
            AI image & video creation platform
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-ink"
          >
            Create without limits.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-ink-muted mt-5 max-w-xl mx-auto"
          >
            Forge turns a single prompt into cinematic images and video — powered by best-in-class
            models, cinematic camera controls, and a full creative workspace.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-3 mt-8 flex-wrap"
          >
            <Link to="/image" className="btn-primary flex items-center gap-2">
              <ImageIcon size={16} /> Create Image
            </Link>
            <Link to="/video" className="btn-secondary flex items-center gap-2">
              <Film size={16} /> Create Video
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured models */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Featured models</h2>
          <Link to="/explore" className="text-sm text-accent flex items-center gap-1 hover:underline">
            Explore all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {models.slice(0, 8).map((m) => <ModelCard key={m.id} model={m} />)}
        </div>
      </section>

      {/* Effects */}
      <section className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Trending effects</h2>
          <Link to="/effects" className="text-sm text-accent flex items-center gap-1 hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {effects.slice(0, 6).map((e) => <EffectCard key={e.id} effect={e} />)}
        </div>
      </section>

      {/* Studios */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <h2 className="text-xl font-bold mb-6">Professional creative studios</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <StudioCard icon={Film} title="Cinema Studio" desc="Camera, lens, lighting and movement controls for true cinematic output." href="/cinema" />
          <StudioCard icon={Sparkles} title="Genjutsu" desc="One upload in. Endless new visions out." href="/genjutsu" />
          <StudioCard icon={ImageIcon} title="Canvas" desc="Node-based visual workflows connecting prompts, models and outputs." href="/canvas" />
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold">Simple, scalable pricing</h2>
        <p className="text-sm text-ink-muted mt-2">Start free. Upgrade anytime as your creative output grows.</p>
        <Link to="/pricing" className="btn-primary inline-flex items-center gap-2 mt-6">
          View pricing <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}

function StudioCard({ icon: Icon, title, desc, href }: { icon: typeof Film; title: string; desc: string; href: string }) {
  return (
    <Link to={href} className="rounded-2xl border border-border bg-panel p-6 hover:border-accent/30 transition-colors block">
      <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
        <Icon size={20} className="text-accent" />
      </div>
      <p className="text-base font-semibold">{title}</p>
      <p className="text-sm text-ink-muted mt-1.5">{desc}</p>
    </Link>
  );
}
