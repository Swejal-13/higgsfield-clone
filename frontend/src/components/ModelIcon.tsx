import {
  Sparkles, Clapperboard, Bot, Flower2, Zap, PenTool, Film, Wand2, Bolt, Waves,
  PersonStanding, Palette, Cpu, Video, Mic, AudioWaveform, Music, LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles, Clapperboard, Bot, Flower2, Zap, PenTool, Film, Wand2, Bolt, Waves,
  PersonStanding, Palette, Cpu, Video, Mic, AudioWaveform, Music,
};

export function ModelIcon({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) {
  const Icon = ICON_MAP[name] || Sparkles;
  return <Icon size={size} className={className} />;
}
