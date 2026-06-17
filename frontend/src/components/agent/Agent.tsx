import solinoBase from "../../assets/agent/solino_base.svg";
import molinoBase from "../../assets/agent/molino_base.svg";
import solinoRing from "../../assets/agent/solino_ring.svg";
import expressionRaisedBrows from "../../assets/agent/expression_guard.svg";
import sleepingEyes from "../../assets/agent/facial-expressions/eyes-sleeping.svg";
import eyes from "../../assets/agent/facial-expressions/eyes.svg";
import mouthOpen from "../../assets/agent/facial-expressions/mouth-open.svg";
import mouthDefault from "../../assets/agent/facial-expressions/mouth-default.svg";
import { useLayoutEffect, useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useWeatherNowcast } from "../../hooks/weather/useWeatherNowcast";
import cloudM from "../../assets/agent/cloud_m.png";
import cloudS from "../../assets/agent/cloud_s.png";
import raindropIcon from "../../assets/agent/raindrop.svg";
import thunderbolt from "../../assets/agent/thunderbolt.svg";
import { TemperatureDisplay } from "./TemperatureDisplay";
import { PhaseSchema, type Phase } from "../../models/simulator/phase.model.js";
import { usePhase } from "../../hooks/usePhase";
import { WeatherConditionSchema } from "../../models/weather/weather-nowcast.model.js";
import {
  type AiState,
  AiStateSchema,
} from "../../models/assistant/ai-state.model.js";
import thinkingBubble from "../../assets/agent/thinking-bubble.svg";

const RAIN_DROP_POSITIONS = [
  "absolute -bottom-9 left-[5%] z-0 w-[20%]",
  "absolute -bottom-9 left-[19%] z-0 w-[20%]",
  "absolute -bottom-9 left-[36%] z-0 w-[20%]",
  "absolute -bottom-9 left-[55%] z-0 w-[20%]",
  "absolute -bottom-9 left-[73%] z-0 w-[20%]",
] as const;

type AgentProps = {
  aiState?: AiState;
  isGuard?: boolean;
};

export function Agent({ isGuard = false, aiState }: AgentProps) {
  const { data: weatherData, isLoading, error } = useWeatherNowcast();
  const phase = usePhase();

  const [showMouthOpen, setShowMouthOpen] = useState(false);
  const isSpeaking = aiState === AiStateSchema.enum.SPEAKING;

  const startSpeakingAnimation = useCallback(() => {
    if (!isSpeaking) {
      return;
    }

    let timeoutId: number;
    const toggleMouth = () => {
      setShowMouthOpen((prev) => !prev);
      const nextDelay = Math.random() * 150 + 100; // between 100ms and 250ms
      timeoutId = window.setTimeout(toggleMouth, nextDelay);
    };

    // Defer the first toggle to make it asynchronous
    timeoutId = window.setTimeout(toggleMouth, 150);

    return () => {
      clearTimeout(timeoutId);
      setShowMouthOpen(false);
    };
  }, [isSpeaking]);

  useEffect(() => {
    return startSpeakingAnimation();
  }, [startSpeakingAnimation]);

  // GSAP
  const weatherLayerRef = useRef<HTMLDivElement | null>(null);
  const raindropRefs = useRef<HTMLImageElement[]>([]);
  const condition = weatherData?.weather_condition;

  // Weather Conditionals
  const isRainy =
    condition === WeatherConditionSchema.enum.Drizzle ||
    condition === WeatherConditionSchema.enum.Rain ||
    condition === WeatherConditionSchema.enum.Thunderstorm;
  const animationsEnabled = true;

  const shouldAnimateRain =
    animationsEnabled && !isLoading && !error && !!weatherData && isRainy;
  const isWeatherUnavailable = !weatherData || !condition;

  useLayoutEffect(() => {
    if (!shouldAnimateRain || !weatherLayerRef.current) return;

    const ctx = gsap.context(() => {
      raindropRefs.current.forEach((drop) => {
        if (!drop) return;

        const tween = gsap.fromTo(
          drop,
          {
            y: -18,
            opacity: 0,
          },
          {
            y: 64,
            opacity: 1,
            duration: gsap.utils.random(1.8, 2.8),
            ease: "power1.in",
            repeat: -1,
            repeatDelay: gsap.utils.random(0.05, 0.35),
            onUpdate() {
              const progress = this.progress();
              gsap.set(drop, {
                opacity:
                  progress < 0.12
                    ? progress / 0.12
                    : 1 - Math.max(0, (progress - 0.78) / 0.22),
              });
            },
          },
        );

        tween.progress(Math.random());
      });
    }, weatherLayerRef);

    return () => ctx.revert();
  }, [shouldAnimateRain]);

  return (
    <>
      <div className="relative w-full h-full p-6">
        <TemperatureDisplay
          temperature={weatherData?.temperature}
          isLoading={isLoading}
          hasError={!!error}
          isUnavailable={isWeatherUnavailable}
        />
        {/* Weather */}
        <div ref={weatherLayerRef}>
          {condition === WeatherConditionSchema.enum.Clouds &&
            displayCloudyWeather()}
          {(condition === WeatherConditionSchema.enum.Drizzle ||
            condition === WeatherConditionSchema.enum.Rain ||
            condition === WeatherConditionSchema.enum.Thunderstorm) &&
            displayRainyWeather()}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <img
            className={`${phase === PhaseSchema.parse("Night") ? "hidden" : "visible"} w-130 max-w-none object-contain ${animationsEnabled ? "animate-[spin_25s_linear_infinite]" : ""}`}
            src={solinoRing}
            alt="Solino Ring"
          />
        </div>
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${phase === PhaseSchema.parse("Night") ? "w-130" : "w-90"}`}
        >
          <img
            className="w-full object-contain"
            src={phase === PhaseSchema.parse("Night") ? molinoBase : solinoBase}
            alt="Solino Base"
          />
          {getExpression(isGuard, phase)}
        </div>
        <div>
          {aiState == AiStateSchema.enum.THINKING && (
            <img
              className="absolute w-50 right-0 top-0"
              src={thinkingBubble}
              alt="Thinking bubble"
            />
          )}
        </div>
      </div>
    </>
  );

  function getExpression(isGuard: boolean, currentPhase: Phase | undefined) {
    if (isGuard) {
      return (
        <img
          className="absolute top-[25%] left-1/2 z-1 w-[25%] -translate-x-1/2"
          src={expressionRaisedBrows}
          alt="Expression of Solino with raised Eyebrows"
        />
      );
    } else if (currentPhase === PhaseSchema.parse("Night")) {
      return (
        <>
          <img
            className="absolute top-[25%] left-1/2 z-1 w-[25%] -translate-x-1/2"
            src={sleepingEyes}
            alt="Sleeping Eyes of Solino"
          />
          {showMouthOpen ? (
            <img
              className="absolute top-[30%] left-1/2 z-1 w-[11%] -translate-x-1/2"
              src={mouthOpen}
              alt="Speaking Mouth Expression of Solino"
            />
          ) : (
            <img
              className="absolute top-[30%] left-1/2 z-1 w-[11%] -translate-x-1/2"
              src={mouthDefault}
              alt="Happy Mouth Expression of Solino"
            />
          )}
        </>
      );
    } else {
      return (
        <>
          <img
            className="absolute top-[25%] left-1/2 z-1 w-[25%] -translate-x-1/2"
            src={eyes}
            alt="Eyes of Solino"
          />
          {showMouthOpen ? (
            <img
              className="absolute top-[32%] left-1/2 z-1 w-[16%] -translate-x-1/2"
              src={mouthOpen}
              alt="Speaking Mouth Expression of Solino"
            />
          ) : (
            <img
              className="absolute top-[32%] left-1/2 z-1 w-[16%] -translate-x-1/2"
              src={mouthDefault}
              alt="Happy Mouth Expression of Solino"
            />
          )}
        </>
      );
    }
  }

  function displayCloudyWeather() {
    return (
      <>
        <img
          className="absolute bottom-[12%] left-[-5%] z-1 w-[60%]"
          src={cloudM}
          alt="Medium-sized cloud"
        />
        <img
          className="absolute bottom-[10%] right-[5%] z-1 w-[35%]"
          src={cloudS}
          alt="small-sized cloud"
        />
        <img
          className="absolute top-[15%] left-[10%] z-0 w-[35%]"
          src={cloudS}
          alt="small-sized cloud"
        />
      </>
    );
  }

  function displayRainyWeather() {
    return (
      <>
        <div className="absolute bottom-[15%] -left-7 w-[60%] z-1">
          {CloudWithRaindrops(0)}
        </div>

        <div className="absolute bottom-[5%] right-[5%] w-[60%] z-1">
          {CloudWithRaindrops(RAIN_DROP_POSITIONS.length)}
        </div>

        <div className="absolute top-[5%] -right-5 w-[60%] z-0">
          {CloudWithRaindrops(RAIN_DROP_POSITIONS.length * 2)}
        </div>
      </>
    );
  }

  function CloudWithRaindrops(startIndex: number) {
    return (
      <>
        {/* Cloud */}
        <img
          className="relative w-full z-1"
          src={cloudM}
          alt="Medium-sized cloud"
        />

        {/* Raindrops */}
        {RAIN_DROP_POSITIONS.map((className, index) => (
          <img
            key={startIndex + index}
            ref={(element) => {
              if (element) {
                raindropRefs.current[startIndex + index] = element;
              }
            }}
            className={className}
            src={raindropIcon}
            alt="Raindrop"
          />
        ))}

        {/*Thunderbolt*/}
        {condition === WeatherConditionSchema.enum.Thunderstorm &&
          startIndex % 2 == 0 && ( //nur an jeder 2. Wolke
            <img
              src={thunderbolt}
              alt="Thunderbolt"
              className="absolute bottom-[-25%] left-[40%] z-0 w-[20%]"
            />
          )}
      </>
    );
  }


}
