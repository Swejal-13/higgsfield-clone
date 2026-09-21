import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { fetchModels } from "@/api/models";
import { fetchEffects } from "@/api/effects";
import { PromoBanner } from "@/components/PromoBanner";
import { ModelCard } from "@/components/ModelCard";
import { EffectCard } from "@/components/EffectCard";
import { mediaUrl } from "@/utils/format";

const COMMUNITY_PROJECTS = Array.from({ length: 8 }, (_, i) => ({
  id: `community-${i + 1}`,
  title: [
    "Neon Nightscape", "Desert Mirage", "Studio Portrait Series", "Product Launch Reel",
    "Urban Fashion Edit", "Cinematic Trailer Cut", "Golden Hour Campaign", "Sci-fi Concept World",
  ][i],
  creator: ["ava.codes", "leo_studio", "mira.visuals", "kenji.ai", "zoe_frames", "theo.render", "nina.creates", "sam.pixels"][i],
  thumbnail: `/demo/images/community-${i + 1}.svg`,
}));

const FEATURED_PROJECTS = Array.from({ length: 4 }, (_, i) => ({
  id: `featured-${i + 1}`,
  title: ["Midnight Metropolis", "Ethereal Portraits", "Product in Motion", "Dreamscape Explorer"][i],
  description: [
    "A neon-lit city brought to life frame by frame.",
    "Soft cinematic light studies of the human form.",
    "Turntable product motion for e-commerce.",
    "Surreal worlds generated from a single line of text.",
  ][i],
  creator: ["studio.nova", "lucid.frames", "orbitlab", "wanderline"][i],
  thumbnail: `/demo/images/sample-${i + 1}.svg`,
}));

export default function Explore() {
  const { data: models = [] } = useQuery({ queryKey: ["explore-models"], queryFn: () => fetchModels() });
  const { data: effects = [] } = useQuery({ queryKey: ["explore-effects"], queryFn: () => fetchEffects() });
  const videoModels = models.filter((m) => m.type === "video");
  const seedance = videoModels.find((m) => m.id === "seedance-2-5");

  return (
    <div>
      <PromoBanner />

      <div className="max-w-[1280px] mx-auto px-6 py-10 space-y-16">
        {/* Featured projects */}
        <section>
          <SectionHeader title="Featured creative projects" href="#" />
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURED_PROJECTS.map((p) => (
              <div key={p.id} className="group relative rounded-2xl overflow-hidden border border-border bg-panel">
                <div className="aspect-[16/10] bg-panel-secondary overflow-hidden">
                  <img src={mediaUrl(p.thumbnail)} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <p className="text-lg font-bold text-white">{p.title}</p>
                  <p className="text-sm text-white/70 mt-1 max-w-sm">{p.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-white/60">by {p.creator}</span>
                    <Link to="/explore" className="text-xs font-semibold bg-accent text-black rounded-full px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      View project
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured models */}
        <section>
          <SectionHeader title="Featured AI models" href="/pricing" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {models.slice(0, 8).map((m) => <ModelCard key={m.id} model={m} />)}
          </div>
        </section>

        {/* Visual effects */}
        <section>
          <SectionHeader title="Visual Effects" href="/effects" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {effects.slice(0, 6).map((e) => <EffectCard key={e.id} effect={e} />)}
          </div>
        </section>

        {/* Seedance spotlight */}
        {seedance && (
          <section className="rounded-2xl border border-accent/20 bg-gradient-to-br from-panel to-panel-secondary p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="badge badge-top">TOP</span>
              <h3 className="text-2xl font-bold mt-2">{seedance.name}</h3>
              <p className="text-sm text-ink-muted mt-1.5 max-w-md">{seedance.description} Cinematic text/image-to-video generation with best-in-class motion coherence.</p>
            </div>
            <Link to={`/video?model=${seedance.id}`} className="btn-primary shrink-0">Try {seedance.name}</Link>
          </section>
        )}

        {/* Community projects */}
        <section>
          <SectionHeader title="Community projects" href="#" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COMMUNITY_PROJECTS.map((p) => (
              <div key={p.id} className="rounded-2xl overflow-hidden border border-border bg-panel">
                <div className="aspect-square bg-panel-secondary">
                  <img src={mediaUrl(p.thumbnail)} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <span className="badge bg-panel-secondary text-ink-muted">Public</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Users size={11} className="text-ink-muted" />
                    <span className="text-xs text-ink-muted">{p.creator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Creative inspiration / explore community CTA */}
        <section className="text-center py-10">
          <h3 className="text-xl font-bold">Explore the community</h3>
          <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">
            Thousands of creators are pushing Higgsfield's models every day. Dive in for inspiration.
          </p>
          <Link to="/contests" className="btn-secondary inline-flex items-center gap-2 mt-5">
            See contests <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <Link to={href} className="text-sm text-accent flex items-center gap-1 hover:underline">
        View all <ArrowRight size={13} />
      </Link>
    </div>
  );
}
