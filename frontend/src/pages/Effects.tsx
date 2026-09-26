import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEffects } from "@/api/effects";
import { EffectCard } from "@/components/EffectCard";
import { EmptyState } from "@/components/EmptyState";
import { Wand2 } from "lucide-react";

const CATEGORIES = ["All", "Trending", "New", "People", "Camera", "Transformation", "Fashion", "Product", "Cinematic", "Social Media"];

export default function Effects() {
  const [category, setCategory] = useState("All");
  const { data: effects = [], isLoading } = useQuery({ queryKey: ["effects-page"], queryFn: () => fetchEffects() });

  const filtered = category === "All" ? effects : effects.filter((e) => e.category === category);

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Effects</h1>
        <p className="text-sm text-ink-muted mt-1">Pick an effect and jump straight into a generation with the preset applied.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              category === c ? "bg-accent text-white border-accent" : "bg-panel text-ink-muted border-border hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <EmptyState icon={Wand2} title="No effects in this category" description="Try a different category filter." />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((e) => <EffectCard key={e.id} effect={e} />)}
      </div>
    </div>
  );
}
