import { useCallback, useEffect, useRef } from "react";
import { trackUxMetric } from "@/services/uxMetrics";

export function useUxMetrics(screen: string) {
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    startedAt.current = Date.now();
    void trackUxMetric({ type: "PAGE_VIEW", screen }).catch(() => undefined);

    return () => {
      const durationMs = Date.now() - startedAt.current;
      void trackUxMetric({
        type: "SCREEN_TIME",
        screen,
        durationMs,
      }).catch(() => undefined);
    };
  }, [screen]);

  const trackAction = useCallback(
    (action: string, metadata?: Record<string, unknown>, success = true) => {
      void trackUxMetric({
        type: "ACTION",
        screen,
        action,
        success,
        metadata,
      }).catch(() => undefined);
    },
    [screen],
  );

  const trackError = useCallback(
    (action: string, errorMessage: string, metadata?: Record<string, unknown>) => {
      void trackUxMetric({
        type: "ERROR",
        screen,
        action,
        success: false,
        metadata: {
          ...metadata,
          errorMessage,
        },
      }).catch(() => undefined);
    },
    [screen],
  );

  return {
    trackAction,
    trackError,
  };
}
