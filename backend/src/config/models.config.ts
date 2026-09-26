export type ModelType = "image" | "video" | "audio";

export interface ModelCapability {
  id: string;
  name: string;
  type: ModelType;
  description: string;
  badge?: "TOP" | "NEW" | "FREE";
  credits: number;
  icon: string; // lucide-react icon name, used by frontend
  capabilities: string[];
  enabled: boolean;
}

export const IMAGE_MODELS: ModelCapability[] = [
  { id: "forge-soul-2", name: "Forge Soul 2.0", type: "image", description: "Flagship photoreal model with cinematic detail.", badge: "TOP", credits: 8, icon: "Sparkles", capabilities: ["text-to-image", "reference", "upscale"], enabled: true },
  { id: "forge-soul-cinema", name: "Forge Soul Cinema", type: "image", description: "Cinematic look with camera-aware composition.", badge: "NEW", credits: 10, icon: "Clapperboard", capabilities: ["text-to-image", "camera-control"], enabled: true },
  { id: "gpt-image", name: "GPT Image", type: "image", description: "Versatile general purpose image model.", credits: 6, icon: "Bot", capabilities: ["text-to-image", "edit"], enabled: true },
  { id: "seedream", name: "Seedream", type: "image", description: "Vivid, stylized image generation.", credits: 6, icon: "Flower2", capabilities: ["text-to-image"], enabled: true },
  { id: "nano-banana-pro", name: "Nano Banana Pro", type: "image", description: "Fast iteration model for quick concepts.", badge: "FREE", credits: 0, icon: "Zap", capabilities: ["text-to-image"], enabled: true },
  { id: "recraft", name: "Recraft", type: "image", description: "Vector and illustration friendly model.", credits: 5, icon: "PenTool", capabilities: ["text-to-image", "vector"], enabled: true },
];

export const VIDEO_MODELS: ModelCapability[] = [
  { id: "seedance-2-5", name: "Seedance 2.5", type: "video", description: "Cinematic text/image-to-video generation.", badge: "TOP", credits: 24, icon: "Film", capabilities: ["text-to-video", "image-to-video"], enabled: true },
  { id: "forge-genjutsu", name: "Forge Genjutsu", type: "video", description: "One upload in, endless new visions out.", badge: "NEW", credits: 20, icon: "Wand2", capabilities: ["video-to-video", "style-transfer"], enabled: true },
  { id: "gemini-omni-flash", name: "Gemini Omni Flash", type: "video", description: "Fast multi-modal video generation.", credits: 16, icon: "Bolt", capabilities: ["text-to-video"], enabled: true },
  { id: "kling-3", name: "Kling 3.0", type: "video", description: "High fidelity motion and physics.", badge: "TOP", credits: 28, icon: "Waves", capabilities: ["text-to-video", "image-to-video"], enabled: true },
  { id: "kling-motion-control", name: "Kling Motion Control", type: "video", description: "Drive a character with a reference motion clip.", credits: 30, icon: "PersonStanding", capabilities: ["motion-control"], enabled: true },
  { id: "flux-video", name: "FLUX Video", type: "video", description: "Stylized, painterly video generation.", credits: 18, icon: "Palette", capabilities: ["text-to-video"], enabled: true },
  { id: "minimax-h3", name: "MiniMax H3", type: "video", description: "Efficient general-purpose video model.", credits: 14, icon: "Cpu", capabilities: ["text-to-video", "image-to-video"], enabled: true },
  { id: "wan-3", name: "Wan 3.0", type: "video", description: "Long-form narrative video generation.", credits: 22, icon: "Video", capabilities: ["text-to-video"], enabled: true },
];

export const AUDIO_MODELS: ModelCapability[] = [
  { id: "forge-voice", name: "Forge Voice", type: "audio", description: "Natural text to speech.", credits: 5, icon: "Mic", capabilities: ["tts"], enabled: true },
  { id: "forge-sfx", name: "Forge SFX", type: "audio", description: "Sound effect generation.", credits: 4, icon: "AudioWaveform", capabilities: ["sfx"], enabled: true },
  { id: "forge-music", name: "Forge Music", type: "audio", description: "Original music generation.", badge: "NEW", credits: 10, icon: "Music", capabilities: ["music"], enabled: true },
];

export const ALL_MODELS: ModelCapability[] = [...IMAGE_MODELS, ...VIDEO_MODELS, ...AUDIO_MODELS];

export function getModelById(id: string): ModelCapability | undefined {
  return ALL_MODELS.find((m) => m.id === id);
}
