import React, { useEffect, useState } from "react";
import { createDayFormatter, createTimeFormatter } from "../utils/time.util";

type TimeWidgetProps = {
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  intervalMs?: number;
};

export default function TimeWidget({
  locale,
  options,
  intervalMs = 1000,
}: TimeWidgetProps): React.ReactElement {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const timeFormatter = createTimeFormatter(locale, options);
  const dayFormatter = createDayFormatter(locale, options);

  return (
    <div className="w-full h-full relative rounded-[50px] bg-black mix-blend-soft-light">
      <div className="flex flex-col justify-center items-center w-full h-full pt-6.25 pb-0 ps-12.5 pe-12.5 rounded-[50px]">
        <div className="text-white text-center font-medium">
          <time className="text-[40px]" dateTime={now.toISOString()}>
            {dayFormatter.format(now).replace(",", "")}{" "}
          </time>
          <time className="text-[100px]" dateTime={now.toISOString()}>
            {timeFormatter.format(now)}{" "}
          </time>
        </div>
      </div>
    </div>
  );
}
