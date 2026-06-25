import { usePhase } from "../../hooks/usePhase";

type TemperatureDisplayProps = {
  temperature?: number;
  isLoading: boolean;
  hasError: boolean;
  isUnavailable: boolean;
};

export function TemperatureDisplay({
  temperature,
  isLoading,
  hasError,
  isUnavailable,
}: TemperatureDisplayProps) {
  const phase = usePhase();
  const textColor = phase === "Night" ? "text-white" : "text-black";

  if (isLoading) {
    return <div className={`font-medium text-5xl ${textColor}`}>...</div>;
  }

  if (hasError) {
    return (
      <div className={`font-medium text-2xl ${textColor}`}>
        Weather unavailable
      </div>
    );
  }

  if (isUnavailable || temperature === undefined) {
    return (
      <div className={`font-medium text-2xl ${textColor}`}>
        No temperature data
      </div>
    );
  }

  return (
    <div className={`font-medium text-5xl mix-blend-soft-light ${textColor}`}>
      {temperature}°C
    </div>
  );
}