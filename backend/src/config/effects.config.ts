export interface EffectPreset {
  camera?: string;
  motion?: string;
  model?: string;
}

export interface Effect {
  id: string;
  name: string;
  category: "Trending" | "New" | "People" | "Camera" | "Transformation" | "Fashion" | "Product" | "Cinematic" | "Social Media";
  description: string;
  type: "image" | "video";
  thumbnail: string;
  preset: EffectPreset;
}

const thumb = (n: number) => `/demo/images/effect-${((n - 1) % 8) + 1}.svg`;

export const EFFECTS: Effect[] = [
  { id: "floating-fall", name: "Floating Fall", category: "Trending", description: "Subject drifts weightlessly through the frame.", type: "video", thumbnail: thumb(1), preset: { camera: "orbit", motion: "slow" } },
  { id: "high-flip", name: "High Flip", category: "People", description: "Dynamic acrobatic flip transition.", type: "video", thumbnail: thumb(2), preset: { camera: "handheld", motion: "fast" } },
  { id: "burning-scene", name: "Burning Scene", category: "Cinematic", description: "Dramatic fire and ember overlay.", type: "video", thumbnail: thumb(3), preset: { camera: "dolly-in", motion: "medium" } },
  { id: "street-motion", name: "Street Motion", category: "Camera", description: "Urban tracking shot with parallax.", type: "video", thumbnail: thumb(4), preset: { camera: "tracking", motion: "medium" } },
  { id: "world-morph", name: "World Morph", category: "Transformation", description: "Environment morphs between two worlds.", type: "video", thumbnail: thumb(5), preset: { camera: "zoom", motion: "slow" } },
  { id: "melting", name: "Melting", category: "Transformation", description: "Surreal melt transformation effect.", type: "video", thumbnail: thumb(6), preset: { camera: "static", motion: "slow" } },
  { id: "cinematic-reveal", name: "Cinematic Reveal", category: "Cinematic", description: "Slow dramatic reveal with depth.", type: "video", thumbnail: thumb(7), preset: { camera: "dolly-in", motion: "slow" } },
  { id: "object-transformation", name: "Object Transformation", category: "Transformation", description: "One object morphs into another.", type: "video", thumbnail: thumb(8), preset: { camera: "static", motion: "medium" } },
  { id: "fashion-motion", name: "Fashion Motion", category: "Fashion", description: "Runway-style garment motion.", type: "video", thumbnail: thumb(1), preset: { camera: "truck", motion: "medium" } },
  { id: "product-spin", name: "Product Spin", category: "Product", description: "360 product turntable spin.", type: "video", thumbnail: thumb(2), preset: { camera: "orbit", motion: "medium" } },
  { id: "social-crop", name: "Social Vertical Cut", category: "Social Media", description: "Auto-reframed vertical social edit.", type: "video", thumbnail: thumb(3), preset: { camera: "static", motion: "slow" } },
  { id: "golden-hour-glow", name: "Golden Hour Glow", category: "New", description: "Warm cinematic golden hour lighting pass.", type: "image", thumbnail: thumb(4), preset: {} },
];

export function getEffectById(id: string) {
  return EFFECTS.find((e) => e.id === id);
}
