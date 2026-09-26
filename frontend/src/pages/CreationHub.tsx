import { Link } from "react-router-dom";
import { Image as ImageIcon, Film, Mic, Wand2, RefreshCw, Move3d, Clapperboard, Sparkles, Workflow, ArrowRight } from "lucide-react";

const PRIMARY_TYPES = [
  { to: "/image", icon: ImageIcon, title: "Image", description: "Generate images from a prompt, with camera and style control." },
  { to: "/video", icon: Film, title: "Video", description: "Text or image to video, from a few seconds up to a full scene." },
  { to: "/audio", icon: Mic, title: "Audio", description: "Voice, sound effects and music generation." },
];

const MORE_TOOLS = [
  { to: "/image/edit", icon: Wand2, title: "Edit an image", description: "Inpaint, relight or upscale an existing image." },
  { to: "/video/edit", icon: RefreshCw, title: "Edit a video", description: "Trim, restyle or extend an existing clip." },
  { to: "/video/motion", icon: Move3d, title: "Motion control", description: "Drive a character with reference motion." },
  { to: "/cinema", icon: Clapperboard, title: "Cinema studio", description: "Multi-shot, camera-directed video production." },
  { to: "/effects", icon: Sparkles, title: "Effects", description: "Apply a preset visual effect to an image or clip." },
  { to: "/genjutsu", icon: Workflow, title: "Genjutsu", description: "Stylized 3D-look transformations." },
];

// Single entry point for every generation surface. Rather than exposing all
// nine creation modes as equal-weight nav items, the three things most
// people want (image / video / audio) are primary, and everything else is
// one click further away under "More tools" — progressive disclosure
// instead of a wall of options up front.
export default function CreationHub() {
  return (
    <div className="max-w-[900px] mx-auto px-4 lg:px-6 py-10 w-full">
      <h1 className="font-display text-2xl font-semibold mb-1">What do you want to make?</h1>
      <p className="text-sm text-ink-muted mb-8">Pick a type to get started. You can switch models and settings on the next screen.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {PRIMARY_TYPES.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group rounded-card border border-border bg-panel p-5 hover:border-accent/40 hover:shadow-subtle transition-all flex flex-col"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
              <t.icon size={18} />
            </div>
            <p className="text-sm font-semibold mb-1 flex items-center gap-1">
              {t.title}
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </p>
            <p className="text-xs text-ink-muted">{t.description}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-4">More tools</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {MORE_TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="flex items-center gap-3 rounded-card border border-border bg-panel px-4 py-3 hover:border-accent/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-panel-secondary text-ink-muted flex items-center justify-center shrink-0">
              <t.icon size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-xs text-ink-muted truncate">{t.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
