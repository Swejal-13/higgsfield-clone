import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Effect } from "@/types";
import { mediaUrl } from "@/utils/format";

export function EffectCard({ effect }: { effect: Effect }) {
  const navigate = useNavigate();

  function handleTry() {
    const target = effect.type === "video" ? "/video" : "/image";
    navigate(`${target}?effect=${effect.id}`);
  }

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-border bg-panel cursor-pointer" onClick={handleTry}>
      <div className="aspect-[3/4] w-full bg-panel-secondary overflow-hidden">
        <img src={mediaUrl(effect.thumbnail)} alt={effect.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-3">
        <p className="text-xs text-accent font-semibold uppercase tracking-wide">{effect.category}</p>
        <p className="text-sm font-semibold text-white mt-0.5">{effect.name}</p>
        <button
          onClick={(e) => { e.stopPropagation(); handleTry(); }}
          className="mt-2 self-start flex items-center gap-1.5 bg-accent text-white text-xs font-semibold rounded-full px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Play size={11} fill="currentColor" /> Try
        </button>
      </div>
    </div>
  );
}
