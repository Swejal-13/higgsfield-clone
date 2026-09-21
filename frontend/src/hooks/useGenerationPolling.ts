import { useEffect, useRef, useState } from "react";
import { getGenerationStatus } from "@/api/generations";
import { Generation } from "@/types";

export function useGenerationPolling(generationId: string | null) {
  const [generation, setGeneration] = useState<Generation | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!generationId) {
      setGeneration(null);
      return;
    }

    let cancelled = false;

    async function poll() {
      try {
        const g = await getGenerationStatus(generationId!);
        if (cancelled) return;
        setGeneration(g);
        if (g.status === "QUEUED" || g.status === "PROCESSING") {
          timer.current = setTimeout(poll, 900);
        }
      } catch {
        if (!cancelled) timer.current = setTimeout(poll, 1500);
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [generationId]);

  return generation;
}
