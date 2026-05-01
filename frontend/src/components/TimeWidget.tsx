import React, { useEffect, useState } from "react";

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

  const time_formatter = new Intl.DateTimeFormat(locale ?? undefined, options ?? {
    hour: "2-digit",
    minute: "2-digit",
  });

   const day_formatter = new Intl.DateTimeFormat(locale ?? undefined, options ?? {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    /*TODO: make widget bg black once the background is established, for now we need the pink bg to see the widget*/
    <div className="w-[423px] h-[239px] relative rounded-[50px] bg-pink-300 mix-blend-soft-light">
      <div className="flex flex-col justify-center items-center w-[423px] h-[239px] pt-[25px] pb-[25px] ps-[50px] pe-[50px] rounded-[50px]">
          <div className="text-white text-center font-medium">
            <time className="text-[40px]"
              dateTime={now.toISOString()}>{day_formatter.format(now)} </time>
            <time className="text-[100px]"
              dateTime={now.toISOString()}>{time_formatter.format(now)} </time>
          </div>
        </div>
    </div>
  )
}
