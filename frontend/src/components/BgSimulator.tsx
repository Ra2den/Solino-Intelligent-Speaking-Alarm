import { useEffect, useState, type ReactNode } from "react";

type BgSimulatorProps = {
  children: ReactNode;
};

export default function BgSimulator({ children }: BgSimulatorProps) {
  const [hour, setHour] = useState(new Date().getHours());

  // update on hour boundary
  useEffect(() => {
    const now = new Date();
    const msUntilNextHour =
      (60 - now.getMinutes()) * 60 * 1000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds();

    const timeout = setTimeout(() => {
      setHour(new Date().getHours());

      const interval = setInterval(
        () => {
          setHour(new Date().getHours());
        },
        60 * 60 * 1000,
      );

      return () => clearInterval(interval);
    }, msUntilNextHour);

    return () => clearTimeout(timeout);
  }, []);

  // Determine class based on hour
  const getBgClass = (hour: number) => {
    if (hour >= 5 && hour <= 7)
      return "bg-gradient-to-b from-[#5C53A5] via-[#DC6F8E] to-[#F3E79B]";
    if (hour >= 8 && hour <= 16)
      return "bg-gradient-to-b from-[#78DDFA] to-[#C5F2FF]";
    if (hour >= 17 && hour <= 19)
      return "bg-gradient-to-t from-[#5C53A5] via-[#DC6F8E] to-[#F3E79B]";
    return "bg-gradient-to-b from-[#081449] to-[#4A468A]";
  };

  const bgClass = getBgClass(hour);

  return <div className={`h-full w-full ${bgClass}`}>{children}</div>;
}
