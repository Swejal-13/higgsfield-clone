// Client-side product preferences: appearance, interface behaviour and
// generation defaults. These are genuinely applied (not just stored) — see
// PreferencesContext, which reacts to changes and writes the relevant
// attributes onto <html>, and ImageStudio/VideoStudio, which read the
// generation defaults as their initial form state.
export type ThemePref = "light" | "dark" | "system";
export type GenerationTypePref = "image" | "video" | "audio";

export interface Preferences {
  theme: ThemePref;
  compactMode: boolean;
  reducedMotion: boolean;
  defaultGenerationType: GenerationTypePref;
  defaultAspectRatio: string;
  defaultQuality: string;
  notifyOnComplete: boolean;
  notifyProductUpdates: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "system",
  compactMode: false,
  reducedMotion: false,
  defaultGenerationType: "image",
  defaultAspectRatio: "1:1",
  defaultQuality: "Standard",
  notifyOnComplete: true,
  notifyProductUpdates: false,
};

const STORAGE_KEY = "forge_preferences";
const PREF_EVENT = "forge:preferences-changed";

export function loadPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Preferences) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent(PREF_EVENT, { detail: prefs }));
}

export function subscribeToPreferences(cb: (prefs: Preferences) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<Preferences>).detail);
  window.addEventListener(PREF_EVENT, handler);
  return () => window.removeEventListener(PREF_EVENT, handler);
}

function resolvedTheme(theme: ThemePref): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

/** Applies theme, density and motion preferences to the document root. */
export function applyPreferencesToDocument(prefs: Preferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", resolvedTheme(prefs.theme));
  root.setAttribute("data-density", prefs.compactMode ? "compact" : "comfortable");
  root.setAttribute("data-motion", prefs.reducedMotion ? "reduced" : "full");
}

/** Clears only client-side preferences, restoring defaults. */
export function clearPreferences() {
  window.localStorage.removeItem(STORAGE_KEY);
  savePreferences(DEFAULT_PREFERENCES);
}

/** Clears locally cached "recent workspace state" (canvas + recent prompts),
 *  without touching account data stored server-side. */
export function clearLocalWorkspaceState() {
  const keysToClear = ["forge_canvas_graph", "forge_recent_prompts"];
  keysToClear.forEach((k) => window.localStorage.removeItem(k));
}

const RECENT_PROMPTS_KEY = "forge_recent_prompts";
const MAX_RECENT_PROMPTS = 12;

export function getRecentPrompts(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_PROMPTS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addRecentPrompt(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return;
  const existing = getRecentPrompts().filter((p) => p !== trimmed);
  const updated = [trimmed, ...existing].slice(0, MAX_RECENT_PROMPTS);
  window.localStorage.setItem(RECENT_PROMPTS_KEY, JSON.stringify(updated));
}
