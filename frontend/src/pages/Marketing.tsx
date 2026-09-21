import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone } from "lucide-react";
import { mediaUrl } from "@/utils/format";

const TEMPLATES = [
  { id: "product-ad", name: "Product Ad", thumb: "/demo/images/sample-1.svg" },
  { id: "instagram-post", name: "Instagram Post", thumb: "/demo/images/sample-2.svg" },
  { id: "instagram-reel", name: "Instagram Reel", thumb: "/demo/images/sample-3.svg" },
  { id: "youtube-thumbnail", name: "YouTube Thumbnail", thumb: "/demo/images/sample-4.svg" },
  { id: "fashion-campaign", name: "Fashion Campaign", thumb: "/demo/images/sample-5.svg" },
  { id: "product-launch", name: "Product Launch", thumb: "/demo/images/sample-6.svg" },
];

export default function Marketing() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mb-4">
          <Megaphone size={22} className="text-accent" />
        </div>
        <h1 className="text-2xl font-bold">Marketing Studio</h1>
        <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">
          Pick a template to jump straight into a generation workspace pre-tuned for that format.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => navigate(t.id.includes("reel") ? `/video?template=${t.id}` : `/image?template=${t.id}`)}
            className="group rounded-2xl overflow-hidden border border-border bg-panel text-left hover:border-accent/30 transition-colors"
          >
            <div className="aspect-video bg-panel-secondary overflow-hidden">
              <img src={mediaUrl(t.thumb)} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-accent mt-1">Use template →</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
