import { useEffect, useState } from "react";

export default function BgSimulator({ children }) {
  const getHour = () => new Date().getHours(); // local time
  const [hour, setHour] = useState((getHour()));

  // update on hour boundary
  useEffect(() => {
    setHour(getHour()); // initial setzen
    const interval = setInterval(() => setHour(getHour()), 60 * 60 * 1000); // every hour
    return () => clearInterval(interval);
  }, []);

  // Determine class based on hour
  const bgClass = (() => {
    if (hour >= 5 && hour <= 7) return "bg-gradient-to-b from-[#5C53A5] via-[#DC6F8E] to-[#F3E79B]";    // sunrise
    if (hour >= 8 && hour <= 16) return "bg-gradient-to-b from-[#78DDFA] to-[#C5F2FF]";                 // day
    if (hour >= 17 && hour <= 19) return "bg-gradient-to-t from-[#5C53A5] via-[#DC6F8E] to-[#F3E79B]";  // sunset
    return "bg-gradient-to-b from-[#081449] to-[#4A468A]";
  })();

  return (
    <div className={`h-full w-full ${bgClass}`}>
      {children}
    </div>
  );
}

