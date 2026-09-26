import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import {
  Preferences,
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  applyPreferencesToDocument,
  subscribeToPreferences,
} from "@/utils/preferences";

interface PreferencesContextValue {
  preferences: Preferences;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());

  useEffect(() => {
    applyPreferencesToDocument(preferences);
  }, [preferences]);

  // Keep in sync across tabs / after Settings writes.
  useEffect(() => subscribeToPreferences(setPreferences), []);

  // React to OS theme changes when the user picked "system".
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (preferences.theme === "system") applyPreferencesToDocument(preferences);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [preferences]);

  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };
        savePreferences(next);
        return next;
      });
    },
    []
  );

  const resetPreferences = useCallback(() => {
    savePreferences(DEFAULT_PREFERENCES);
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreference, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
