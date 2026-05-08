import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Phase } from "../models/simulator/phase.model.js";
import { getNextTransition, getPhase } from "../utils/phase.util.js";
import { PhaseContext } from "./phase-context";

type PhaseProviderProps = {
  children: ReactNode;
};

export function PhaseProvider({ children }: PhaseProviderProps) {
  const [phase, setPhase] = useState<Phase>();

  useEffect(() => {
    let timeoutId: number | undefined;
    let isCancelled = false;

    // After the last sunset transition, phase data needs to be refreshed for
    // the next calendar day.
    const getStartOfNextDay = (now: number) => {
      const nextDay = new Date(now);
      nextDay.setHours(24, 0, 0, 0);
      return nextDay.getTime();
    };

    // Keep exactly one pending re-sync so all phase consumers stay aligned.
    const scheduleNextRun = (delay: number) => {
      if (isCancelled || delay <= 0) return;

      timeoutId = window.setTimeout(() => {
        void syncPhase();
      }, delay);
    };

    async function syncPhase() {
      try {
        if (isCancelled) return;

        const nextPhase = await getPhase();

        if (isCancelled) return;
        setPhase(nextPhase);

        const nextTransition = await getNextTransition();
        const now = Date.now();
        const delay =
          nextTransition !== undefined
            ? nextTransition - now
            : getStartOfNextDay(now) - now;

        scheduleNextRun(delay);
      } catch (error) {
        console.error("phaseProvider.syncPhase error:", error);
        // Temporary weather API failures should not freeze the UI permanently.
        scheduleNextRun(60 * 1000);
      }
    }

    // Load the current phase immediately on mount, then hand off to the timer.
    void syncPhase();

    return () => {
      isCancelled = true;

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <PhaseContext.Provider value={phase}>{children}</PhaseContext.Provider>
  );
}
