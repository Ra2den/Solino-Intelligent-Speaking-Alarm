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
  if (isLoading) {
    return <div className="font-medium text-5xl">...</div>;
  }

  if (hasError) {
    return <div className="font-medium text-2xl">Weather unavailable</div>;
  }

  if (isUnavailable || temperature === undefined) {
    return <div className="font-medium text-2xl">No temperature data</div>;
  }

  return <div className="font-medium text-5xl">{temperature}°C</div>;
}
