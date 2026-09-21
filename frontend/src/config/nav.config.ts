export interface NavFeature {
  label: string;
  description: string;
  href: string;
  badge?: "TOP" | "NEW" | "FREE";
}

export const IMAGE_DROPDOWN_FEATURES: NavFeature[] = [
  { label: "Create Image", description: "Generate AI images", href: "/image" },
  { label: "Cinematic Cameras", description: "Image generation with camera controls", href: "/image?mode=camera" },
  { label: "Canvas", description: "Visual ideation and workflows", href: "/canvas" },
  { label: "Soul Moodboard", description: "Reference-based moodboards", href: "/image?mode=moodboard" },
  { label: "Soul ID Character", description: "Create characters", href: "/image?mode=character", badge: "NEW" },
  { label: "AI Influencer", description: "Create/manage AI influencer", href: "/image?mode=influencer" },
  { label: "Photodump", description: "Create aesthetic image sets", href: "/image?mode=photodump" },
  { label: "Relight", description: "Adjust lighting", href: "/image/edit?tool=relight" },
  { label: "Inpaint", description: "Edit selected areas", href: "/image/edit?tool=inpaint" },
  { label: "Upscale", description: "Increase image quality", href: "/image/edit?tool=upscale" },
  { label: "Edit Image", description: "AI image editing", href: "/image/edit" },
];

export const VIDEO_DROPDOWN_FEATURES: NavFeature[] = [
  { label: "Create Video", description: "Text or image to video", href: "/video" },
  { label: "Cinema Studio", description: "Professional cinematic production", href: "/cinema" },
  { label: "Faceless Studio", description: "Voiceover-driven video", href: "/video?mode=faceless" },
  { label: "3D Jutsu", description: "3D-style transformations", href: "/genjutsu?mode=3d" },
  { label: "Shorts Studio", description: "Vertical short-form video", href: "/video?mode=shorts" },
  { label: "Higgsfield Explainer", description: "Explainer-style video", href: "/video?mode=explainer" },
  { label: "Canvas", description: "Visual ideation and workflows", href: "/canvas" },
  { label: "Mixed Media", description: "Combine image, video and audio", href: "/video?mode=mixed" },
  { label: "Edit Video", description: "AI video editing", href: "/video/edit" },
  { label: "Motion Control", description: "Drive a character with reference motion", href: "/video/motion" },
];

export const IMAGE_DROPDOWN_MODELS = [
  "higgsfield-soul-2",
  "higgsfield-soul-cinema",
  "gpt-image",
  "seedream",
  "nano-banana-pro",
  "recraft",
];

export const VIDEO_DROPDOWN_MODELS = [
  "seedance-2-5",
  "higgsfield-genjutsu",
  "gemini-omni-flash",
  "kling-3",
  "kling-motion-control",
  "flux-video",
  "minimax-h3",
  "wan-3",
];

export interface NavLink {
  label: string;
  href?: string;
  badge?: "NEW" | "FREE";
  dropdown?: "image" | "video";
}

export const PRIMARY_NAV: NavLink[] = [
  { label: "Explore", href: "/explore" },
  { label: "Image", dropdown: "image" },
  { label: "Video", dropdown: "video" },
  { label: "Audio", href: "/audio" },
  { label: "MCP", href: "/mcp" },
  { label: "API", href: "/api-docs", badge: "NEW" },
];

export const SECONDARY_NAV: NavLink[] = [
  { label: "ChatGPT Plugin", href: "/chatgpt-plugin", badge: "NEW" },
  { label: "Genjutsu", href: "/genjutsu", badge: "FREE" },
  { label: "Effects", href: "/effects", badge: "FREE" },
  { label: "Cinema Studio", href: "/cinema" },
  { label: "Contests", href: "/contests" },
  { label: "Marketing Studio", href: "/marketing" },
];

export const FOOTER_LINKS = {
  Product: [
    { label: "Image", href: "/image" },
    { label: "Video", href: "/video" },
    { label: "Audio", href: "/audio" },
    { label: "Effects", href: "/effects" },
    { label: "Cinema Studio", href: "/cinema" },
  ],
  Resources: [
    { label: "API", href: "/api-docs" },
    { label: "MCP", href: "/mcp" },
    { label: "Help", href: "/settings" },
    { label: "Community", href: "/explore" },
  ],
  Company: [
    { label: "Enterprise", href: "/pricing" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contests", href: "/contests" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};
