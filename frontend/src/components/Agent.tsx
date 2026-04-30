import solinoBase from "../assets/agent/solino_base.svg";
import solinoRing from "../assets/agent/solino_ring.svg";
import expressionDefault from "../assets/agent/expression_default.svg";
import expressionRaisedBrows from "../assets/agent/expression_guard.svg";
import { useWeatherNowcast } from "../hooks/weather/useWeatherNowcast";
import { type WeatherCondition } from "../models/weather/weather-nowcast.model";

export function Agent() {
  const { data: weatherData, isLoading, error } = useWeatherNowcast();

  if (isLoading) return <div>Loading weather...</div>;

  if (error) return <div>Failed to load weather</div>;

  const condition = weatherData?.weather_condition;

  if (!weatherData || !condition) return <div>Weather data unavailable</div>;

  determineWeatherDisplay(condition);

  return (
    <>
      <div className="relative bg-blue-100 w-full h-full p-6">
        <div className="font-medium text-5xl">{weatherData.temperature}°C</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <img
            className="w-150 max-w-none object-contain animate-[spin_15s_linear_infinite]"
            src={solinoRing}
            alt="Solino Ring"
          />
        </div>
        <div className="absolute top-1/2 left-1/2 w-100 -translate-x-1/2 -translate-y-1/2">
          <img
            className="w-full object-contain"
            src={solinoBase}
            alt="Solino Base"
          />
          {getExpression(false)}
        </div>
      </div>
    </>
  );

  function getExpression(isGuard: boolean) {
    if (isGuard) {
      return (
        <img
          className="absolute top-[25%] left-1/2 z-1 w-[35%] -translate-x-1/2"
          src={expressionRaisedBrows}
          alt="Expression of Solino with raised Eyebrows"
        />
      );
    } else {
      return (
        <img
          className="absolute top-[25%] left-1/2 z-1 w-[30%] -translate-x-1/2"
          src={expressionDefault}
          alt="Happy Expression of Solino"
        />
      );
    }
  }

  function determineWeatherDisplay(weatherCondition: WeatherCondition) {
    switch (weatherCondition) {
      case "Thunderstorm":
      case "Rain":
      case "Drizzle":
        console.log("Rainy weather");
        break;
      case "Clear":
        console.log("Good weather");
        break;
      case "Clouds":
        console.log("Cloudy weather");
        break;
      default:
        console.log("Unknown condition");
    }
  }
}
