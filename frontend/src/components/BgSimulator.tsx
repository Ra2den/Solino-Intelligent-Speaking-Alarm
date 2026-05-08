import type { ReactNode } from "react";
import { usePhase } from "../hooks/usePhase";

type BgSimulatorProps = {
  children: ReactNode;
};

export default function BgSimulator({ children }: BgSimulatorProps) {
  const phase = usePhase();

  const getBgClass = () => {
    if (phase == "Sunrise")
      return "bg-gradient-to-b from-[#5C53A5] via-[#DC6F8E] to-[#F3E79B]";
    if (phase == "Day") return "bg-gradient-to-b from-[#78DDFA] to-[#C5F2FF]";
    if (phase == "Sunset")
      return "bg-gradient-to-t from-[#5C53A5] via-[#DC6F8E] to-[#F3E79B]";
    return "bg-gradient-to-b from-[#081449] to-[#4A468A]";
  };

  const bgClass = getBgClass();

  return <div className={`h-full w-full ${bgClass}`}>{children}</div>;
}
