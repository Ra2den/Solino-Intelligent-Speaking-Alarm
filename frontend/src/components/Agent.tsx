import solinoBase from "../assets/agent/solino_base.svg";
import solinoRing from "../assets/agent/solino_ring.svg";
import expressionDefault from "../assets/agent/expression_default.svg";
import gsap from "gsap";
import { useWeatherNowcast } from "../hooks/weather/useWeatherNowcast";
import { type WeatherCondition } from "../models/weather/weather-nowcast.model";

export function Agent() {
  const { data: weatherData, isLoading, error } = useWeatherNowcast();

  const condition = weatherData?.weather_condition;

  if (!condition) return;

  determineWeatherDisplay(condition);

  if (isLoading) return <div>Loading weather...</div>;

  if (error) return <div>Failed to load weather</div>;

  initInfiniteRotationRing();
  return (
    <>
      <div className="relative bg-blue-100 w-full h-full">
        <img
          className="z-1 absolute w-30 top-70 left-1/2 -translate-x-1/2 -translate-y-1/2"
          src={expressionDefault}
          alt="Happy Expression of Solino"
        />
        <img
          className="solinoRing absolute w-150 top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
          src={solinoRing}
          alt="Solino Ring"
        />
        <img
          className="absolute top-1/2 w-100 left-1/2 -translate-x-1/2 -translate-y-1/2"
          src={solinoBase}
          alt="Solino Base"
        />
      </div>
    </>
  );

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

  function initInfiniteRotationRing() {
    gsap.to(".solinoRing", {
      repeat: -1,
      duration: 15,
      ease: "none",
      rotation: -360,
    });
  }
}
