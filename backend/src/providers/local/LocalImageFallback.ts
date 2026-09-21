// Local, zero-dependency fallback for image generation.
//
// This never calls any external API. It looks for keywords in the prompt
// and renders a small hand-coded SVG illustration that matches the theme
// (e.g. "a flower in a field" -> a flower drawing). If nothing matches, it
// falls back to a generic abstract illustration built from the prompt text.
//
// It exists so a demo never hard-fails just because Gemini is down, out of
// quota, or unreachable: ExternalImageProvider calls buildFallbackOutputs()
// whenever the real API call throws.
import { GenerationOutput } from "../ProviderTypes";

//const PUBLIC_DIR = path.join(__dirname, "..", "..", "..", "public");
//const OUTPUT_DIR = path.join(PUBLIC_DIR, "uploads");
//if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

interface Theme {
  keywords: string[];
  colors: [string, string]; // gradient stops
  draw: (accent: string) => string; // inner SVG markup, viewBox 0 0 400 400
}

function svgWrap(bgFrom: string, bgTo: string, inner: string, label: string, gradId: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgFrom}"/>
      <stop offset="100%" stop-color="${bgTo}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#${gradId})"/>
  ${inner}
  <text x="200" y="378" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.85)" text-anchor="middle">${escapeXml(label)}</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const THEMES: Theme[] = [
  {
    keywords: ["flower", "rose", "garden", "blossom", "petal", "bloom"],
    colors: ["#fbc2eb", "#a6c1ee"],
    draw: (accent) => `
      <g transform="translate(200,235)">
        <line x1="0" y1="0" x2="0" y2="120" stroke="#4c9a4c" stroke-width="8" stroke-linecap="round"/>
        <path d="M0,60 Q-40,50 -40,90" stroke="#4c9a4c" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M0,80 Q40,70 45,110" stroke="#4c9a4c" stroke-width="6" fill="none" stroke-linecap="round"/>
        <g transform="translate(0,-30)">
          ${[0, 60, 120, 180, 240, 300]
            .map(
              (a) =>
                `<ellipse cx="0" cy="-42" rx="22" ry="34" fill="${accent}" transform="rotate(${a})"/>`
            )
            .join("\n          ")}
          <circle r="22" fill="#ffd166"/>
        </g>
      </g>`,
  },
  {
    keywords: ["sun", "sunny", "sunshine", "summer", "desert"],
    colors: ["#ffd89b", "#ff8a5b"],
    draw: (accent) => `
      <g transform="translate(200,190)">
        ${Array.from({ length: 12 })
          .map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            const x1 = Math.cos(a) * 80,
              y1 = Math.sin(a) * 80;
            const x2 = Math.cos(a) * 115,
              y2 = Math.sin(a) * 115;
            return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(
              1
            )}" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
          })
          .join("\n        ")}
        <circle r="70" fill="${accent}"/>
      </g>`,
  },
  {
    keywords: ["moon", "night", "star", "galaxy", "space", "cosmos", "sky at night"],
    colors: ["#0f2027", "#2c5364"],
    draw: (accent) => `
      <circle cx="150" cy="150" r="60" fill="#f5f3ce"/>
      <circle cx="128" cy="130" r="55" fill="url(#nightmask)"/>
      <defs><radialGradient id="nightmask"><stop offset="0%" stop-color="#0f2027"/><stop offset="100%" stop-color="#0f2027"/></radialGradient></defs>
      ${[
        [260, 90],
        [300, 160],
        [80, 240],
        [330, 260],
        [230, 300],
        [60, 90],
      ]
        .map(([x, y]) => `<path d="M${x},${y} l4,10 l10,2 l-10,2 l-4,10 l-4,-10 l-10,-2 l10,-2 z" fill="${accent}"/>`)
        .join("\n      ")}`,
  },
  {
    keywords: ["tree", "forest", "wood", "jungle", "leaf", "leaves", "nature"],
    colors: ["#a8e063", "#56ab2f"],
    draw: (accent) => `
      <rect x="185" y="230" width="30" height="90" fill="#6b4226" rx="6"/>
      <circle cx="200" cy="200" r="70" fill="${accent}"/>
      <circle cx="150" cy="230" r="50" fill="${accent}"/>
      <circle cx="250" cy="230" r="50" fill="${accent}"/>`,
  },
  {
    keywords: ["mountain", "hill", "peak", "alps", "snow", "hiking"],
    colors: ["#89f7fe", "#66a6ff"],
    draw: (accent) => `
      <polygon points="80,300 200,140 260,230 220,300" fill="${accent}"/>
      <polygon points="200,300 300,170 380,300" fill="#5b7a9d"/>
      <polygon points="200,140 215,175 185,175" fill="#ffffff"/>
      <polygon points="300,170 312,198 288,198" fill="#ffffff"/>
      <circle cx="330" cy="90" r="30" fill="#ffe066"/>`,
  },
  {
    keywords: ["ocean", "sea", "wave", "beach", "surf", "water", "lake", "river"],
    colors: ["#2193b0", "#6dd5ed"],
    draw: (accent) => `
      <circle cx="330" cy="80" r="34" fill="#ffe066"/>
      ${[260, 300, 340]
        .map(
          (y, i) =>
            `<path d="M0,${y} Q50,${y - 20} 100,${y} T200,${y} T300,${y} T400,${y} V400 H0 Z" fill="${
              i % 2 === 0 ? accent : "#1c7a94"
            }" opacity="${0.9 - i * 0.15}"/>`
        )
        .join("\n      ")}`,
  },
  {
    keywords: ["cat", "kitten", "kitty"],
    colors: ["#f6d365", "#fda085"],
    draw: (accent) => `
      <g transform="translate(200,210)">
        <polygon points="-70,-60 -40,-110 -10,-60" fill="${accent}"/>
        <polygon points="70,-60 40,-110 10,-60" fill="${accent}"/>
        <ellipse rx="80" ry="70" fill="${accent}"/>
        <circle cx="-28" cy="-8" r="9" fill="#2b2b2b"/>
        <circle cx="28" cy="-8" r="9" fill="#2b2b2b"/>
        <polygon points="0,10 -8,22 8,22" fill="#e0607e"/>
        <line x1="-70" y1="18" x2="-15" y2="14" stroke="#2b2b2b" stroke-width="3"/>
        <line x1="-70" y1="30" x2="-15" y2="24" stroke="#2b2b2b" stroke-width="3"/>
        <line x1="70" y1="18" x2="15" y2="14" stroke="#2b2b2b" stroke-width="3"/>
        <line x1="70" y1="30" x2="15" y2="24" stroke="#2b2b2b" stroke-width="3"/>
      </g>`,
  },
  {
    keywords: ["dog", "puppy", "pup"],
    colors: ["#d9a066", "#a86b3c"],
    draw: (accent) => `
      <g transform="translate(200,210)">
        <ellipse rx="82" ry="72" fill="${accent}"/>
        <ellipse cx="-65" cy="-10" rx="24" ry="40" fill="#7a4a25" transform="rotate(-15 -65 -10)"/>
        <ellipse cx="65" cy="-10" rx="24" ry="40" fill="#7a4a25" transform="rotate(15 65 -10)"/>
        <circle cx="-26" cy="-6" r="8" fill="#2b2b2b"/>
        <circle cx="26" cy="-6" r="8" fill="#2b2b2b"/>
        <ellipse cx="0" cy="16" rx="14" ry="10" fill="#2b2b2b"/>
        <path d="M0,26 Q-16,42 -30,34" stroke="#2b2b2b" stroke-width="4" fill="none"/>
        <path d="M0,26 Q16,42 30,34" stroke="#2b2b2b" stroke-width="4" fill="none"/>
      </g>`,
  },
  {
    keywords: ["bird", "eagle", "sparrow", "parrot", "owl"],
    colors: ["#89f7fe", "#c3f584"],
    draw: (accent) => `
      <g transform="translate(200,200)">
        <ellipse rx="55" ry="45" fill="${accent}"/>
        <circle cx="45" cy="-20" r="26" fill="${accent}"/>
        <circle cx="55" cy="-24" r="5" fill="#2b2b2b"/>
        <polygon points="70,-24 92,-18 70,-12" fill="#ff8c42"/>
        <path d="M-20,0 Q-90,10 -70,50 Q-30,40 -10,20 Z" fill="#e0e0e0"/>
      </g>`,
  },
  {
    keywords: ["house", "home", "cabin", "cottage", "building interior", "architecture"],
    colors: ["#fddb92", "#d1fdff"],
    draw: (accent) => `
      <polygon points="200,120 320,220 80,220" fill="#c0392b"/>
      <rect x="100" y="220" width="200" height="120" fill="${accent}"/>
      <rect x="180" y="270" width="40" height="70" fill="#6b4226"/>
      <rect x="120" y="245" width="35" height="35" fill="#87ceeb"/>
      <rect x="245" y="245" width="35" height="35" fill="#87ceeb"/>`,
  },
  {
    keywords: ["car", "vehicle", "automobile", "race car", "truck"],
    colors: ["#485563", "#29323c"],
    draw: (accent) => `
      <g transform="translate(200,230)">
        <rect x="-120" y="-20" width="240" height="50" rx="18" fill="${accent}"/>
        <polygon points="-70,-20 -40,-60 60,-60 90,-20" fill="${accent}"/>
        <rect x="-30" y="-52" width="80" height="32" fill="#bfe9ff"/>
        <circle cx="-70" cy="35" r="26" fill="#222"/>
        <circle cx="70" cy="35" r="26" fill="#222"/>
        <circle cx="-70" cy="35" r="10" fill="#888"/>
        <circle cx="70" cy="35" r="10" fill="#888"/>
      </g>`,
  },
  {
    keywords: ["robot", "android", "ai", "cyborg", "machine"],
    colors: ["#8e9eab", "#eef2f3"],
    draw: (accent) => `
      <g transform="translate(200,200)">
        <rect x="-60" y="-70" width="120" height="100" rx="16" fill="${accent}"/>
        <circle cx="-25" cy="-25" r="12" fill="#2fd1ff"/>
        <circle cx="25" cy="-25" r="12" fill="#2fd1ff"/>
        <rect x="-30" y="10" width="60" height="10" rx="5" fill="#2b2b2b"/>
        <rect x="-15" y="-100" width="30" height="25" fill="${accent}"/>
        <circle cx="0" cy="-108" r="8" fill="#ff5c5c"/>
        <rect x="-90" y="-40" width="30" height="80" rx="10" fill="${accent}"/>
        <rect x="60" y="-40" width="30" height="80" rx="10" fill="${accent}"/>
      </g>`,
  },
  {
    keywords: ["rocket", "spaceship", "astronaut", "planet", "mars"],
    colors: ["#141e30", "#243b55"],
    draw: (accent) => `
      <g transform="translate(200,220) rotate(-10)">
        <path d="M0,-120 C40,-70 40,20 0,60 C-40,20 -40,-70 0,-120 Z" fill="${accent}"/>
        <circle cx="0" cy="-40" r="16" fill="#141e30"/>
        <polygon points="-15,40 -45,90 -5,65" fill="#ff6b6b"/>
        <polygon points="15,40 45,90 5,65" fill="#ff6b6b"/>
        <polygon points="-10,60 0,105 10,60" fill="#ffd166"/>
      </g>
      <circle cx="330" cy="80" r="22" fill="#ff9f68"/>
      <circle cx="60" cy="60" r="3" fill="#fff"/>
      <circle cx="100" cy="120" r="2" fill="#fff"/>
      <circle cx="340" cy="200" r="2" fill="#fff"/>`,
  },
  {
    keywords: ["heart", "love", "romance", "valentine"],
    colors: ["#ff9a9e", "#fecfef"],
    draw: (accent) => `
      <path d="M200,300 C120,230 60,180 60,120 C60,80 95,50 135,50 C165,50 190,68 200,95 C210,68 235,50 265,50 C305,50 340,80 340,120 C340,180 280,230 200,300 Z" fill="${accent}"/>`,
  },
  {
    keywords: ["city", "skyline", "urban", "downtown", "skyscraper"],
    colors: ["#232526", "#414345"],
    draw: (accent) => `
      ${[
        [40, 220, 50, 160],
        [100, 180, 60, 200],
        [170, 140, 70, 240],
        [250, 190, 55, 190],
        [315, 160, 60, 220],
      ]
        .map(
          ([x, y, w, h]) =>
            `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${accent}"/>`
        )
        .join("\n      ")}
      <circle cx="330" cy="90" r="26" fill="#ffe066"/>`,
  },
  {
    keywords: ["cloud", "rain", "storm", "weather", "overcast"],
    colors: ["#757f9a", "#d7dde8"],
    draw: (accent) => `
      <g fill="${accent}">
        <ellipse cx="180" cy="180" rx="70" ry="45"/>
        <ellipse cx="240" cy="170" rx="55" ry="40"/>
        <ellipse cx="140" cy="200" rx="50" ry="35"/>
      </g>
      ${[150, 190, 230].map((x, i) => `<line x1="${x}" y1="230" x2="${x - 10}" y2="270" stroke="#4a90e2" stroke-width="5" stroke-linecap="round"/>`).join("\n      ")}`,
  },
  {
    keywords: ["fire", "flame", "campfire", "burning", "volcano"],
    colors: ["#f12711", "#f5af19"],
    draw: (accent) => `
      <path d="M200,320 C120,320 100,250 140,200 C130,230 160,240 160,210 C160,170 190,150 180,110 C230,140 250,190 220,230 C260,220 260,180 260,180 C300,240 280,320 200,320 Z" fill="${accent}"/>`,
  },
  {
    keywords: ["pizza", "food", "meal", "dinner", "cooking", "burger"],
    colors: ["#ffb347", "#ffcc33"],
    draw: (accent) => `
      <path d="M200,80 L330,320 L70,320 Z" fill="${accent}"/>
      <path d="M200,110 L305,300 L95,300 Z" fill="#ffe08a"/>
      <circle cx="180" cy="180" r="10" fill="#c0392b"/>
      <circle cx="230" cy="210" r="10" fill="#c0392b"/>
      <circle cx="190" cy="250" r="10" fill="#c0392b"/>
      <circle cx="240" cy="150" r="8" fill="#27ae60"/>`,
  },
  {
    keywords: ["coffee", "latte", "espresso", "cafe", "tea"],
    colors: ["#3e2723", "#795548"],
    draw: (accent) => `
      <path d="M120,150 h160 v90 a80,80 0 0 1 -160,0 z" fill="${accent}"/>
      <path d="M280,170 h30 a30,30 0 0 1 0,60 h-20" fill="none" stroke="${accent}" stroke-width="14"/>
      <path d="M150,120 q10,-20 0,-40" stroke="#d7ccc8" stroke-width="6" fill="none"/>
      <path d="M190,120 q10,-20 0,-40" stroke="#d7ccc8" stroke-width="6" fill="none"/>`,
  },
  {
    keywords: ["music", "song", "note", "guitar", "concert", "piano"],
    colors: ["#654ea3", "#eaafc8"],
    draw: (accent) => `
      <g fill="${accent}">
        <circle cx="150" cy="270" r="26"/>
        <circle cx="260" cy="290" r="26"/>
        <rect x="172" y="120" width="10" height="150"/>
        <rect x="282" y="140" width="10" height="150"/>
        <path d="M172,120 L292,140 L292,165 L172,145 Z"/>
      </g>`,
  },
];

const DEFAULT_COLORS: [string, string][] = [
  ["#667eea", "#764ba2"],
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
];

function pickTheme(prompt: string): Theme | null {
  const lower = prompt.toLowerCase();
  for (const theme of THEMES) {
    if (theme.keywords.some((k) => lower.includes(k))) return theme;
  }
  return null;
}

function abstractDraw(seed: number, accent: string): string {
  // Deterministic-but-varied geometric composition for prompts with no keyword match.
  const shapes: string[] = [];
  const n = 5 + (seed % 4);
  for (let i = 0; i < n; i++) {
    const cx = 60 + ((seed * (i + 3) * 37) % 280);
    const cy = 60 + ((seed * (i + 5) * 53) % 280);
    const r = 20 + ((seed * (i + 2) * 17) % 60);
    const op = (0.25 + (i % 3) * 0.2).toFixed(2);
    shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent}" opacity="${op}"/>`);
  }
  return shapes.join("\n      ");
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function renderOne(prompt: string, index: number): string {
  const theme = pickTheme(prompt);
  const seed = hashString(prompt) + index * 97;
  const gradId = `g${seed}`;
  const label = prompt.trim() ? truncate(prompt.trim(), 46) : "Untitled";

  if (theme) {
    const [from, to] = theme.colors;
    const accent = index % 2 === 0 ? "#ffffff" : to;
    const inner = theme.draw(accent === to ? "#ffffff" : accent);
    return svgWrap(from, to, inner, label, gradId);
  }

  const [from, to] = DEFAULT_COLORS[seed % DEFAULT_COLORS.length];
  const inner = abstractDraw(seed, "#ffffff");
  return svgWrap(from, to, inner, label, gradId);
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// Renders `count` local SVG illustrations for the given prompt and writes
// them to the same /uploads directory the real provider uses, so the rest
// of the app (asset storage, history, viewer) treats them identically.
export function buildFallbackOutputs(
  prompt: string,
  count: number
): GenerationOutput[] {
  const n = Math.max(1, Math.min(count, 4));
  const outputs: GenerationOutput[] = [];

  for (let i = 0; i < n; i++) {
    const svg = renderOne(prompt || "", i);
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg, "utf-8").toString("base64")}`;

    outputs.push({
      url: dataUrl,
      thumbnailUrl: dataUrl,
      type: "image",
      metadata: {
        generatedAt: new Date().toISOString(),
        provider: "local-fallback",
        note: "Generated locally (no external API call) because the AI image provider was unavailable.",
      },
    });
  }

  return outputs;
}
