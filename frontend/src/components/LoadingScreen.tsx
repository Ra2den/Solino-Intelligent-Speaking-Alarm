import { useEffect, useState } from "react";
import { usePhase } from "../hooks/usePhase";
import solinoBase from "../assets/agent/solino_base.svg";
import solinoRing from "../assets/agent/solino_ring.svg";
import { PhaseSchema } from "../models/simulator/phase.model";

type LoadingScreenProps = {
  isPhaseLoading: boolean;
  isWeatherLoading: boolean;
  isSessionLoading: boolean;
};

export function LoadingScreen({
  isPhaseLoading,
  isWeatherLoading,
  isSessionLoading,
}: LoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [fadeAway, setFadeAway] = useState(false);
  const isLoading = isPhaseLoading || isWeatherLoading || isSessionLoading;

  useEffect(() => {
    if (!isLoading) {
      setFadeAway(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 800); // Match duration-700 transition + buffer
      return () => clearTimeout(timer);
    } else {
      setFadeAway(false);
      setShouldRender(true);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  // Calculate progress percent based on completed items
  const progressPercent =
    (!isPhaseLoading ? 33 : 0) +
    (!isWeatherLoading ? 33 : 0) +
    (!isSessionLoading ? 34 : 0);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#081449] to-[#4A468A] transition-all duration-700 ease-out ${
        fadeAway
          ? "opacity-0 pointer-events-none scale-[1.03]"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,117,81,0.08)_0%,transparent_60%)] pointer-events-none" />

      {/* Main Row: Solino Sun (Base and Ring) next to the "Solino" Text */}
      <div className="flex items-center gap-6 z-10 mb-8">
        {/* Solino Sun (Base and Ring) */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Ring (spinning) */}
          <img
            className="absolute w-36 max-w-none object-contain animate-[spin_25s_linear_infinite]"
            src={solinoRing}
            alt="Solino Ring"
          />
          {/* Base */}
          <img
            className="absolute w-24 h-24 object-contain"
            src={solinoBase}
            alt="Solino Base"
          />
        </div>

        {/* Text "Solino" */}
        <h1 className="text-8xl font-extrabold tracking-wide text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-slate-300">
          Solino
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400/90 mb-10 z-10">
        An Intelligent Speaking Alarm
      </p>

      {/* Loading Status Text */}
      <div className="h-6 flex items-center justify-center mb-4 z-10">
        <p className="text-xs font-semibold text-orange-400/80 uppercase tracking-widest animate-pulse">
          {isPhaseLoading
            ? "Syncing day cycle phase..."
            : isWeatherLoading
              ? "Analyzing nowcast..."
              : isSessionLoading
                ? "Establishing connection..."
                : "System ready"}
        </p>
      </div>

      {/* Loading Bar */}
      <div className="w-60 h-2 bg-slate-800/80 rounded-full overflow-hidden border border-white/5 z-10">
        <div
          className="h-full bg-linear-to-r from-orange-500 to-amber-300 transition-all duration-500 ease-out"
          style={{
            width: `${progressPercent}%`,
          }}
        />
      </div>
    </div>
  );
}
