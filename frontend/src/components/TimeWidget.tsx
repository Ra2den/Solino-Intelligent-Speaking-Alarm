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

  const time_formatter = new Intl.DateTimeFormat(
    locale ?? undefined,
    options ?? {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const day_formatter = new Intl.DateTimeFormat(
    locale ?? undefined,
    options ?? {
      weekday: "long",
      day: "2-digit",
      month: "long",
    },
  );

  return (
    <div className="w-full h-full relative rounded-[50px] bg-black mix-blend-soft-light">
      <div className="flex flex-col justify-center items-center w-full h-full pt-6.25 pb-6.25 ps-12.5 pe-12.5 rounded-[50px]">
        <div className="text-white text-center font-medium">
          <time className="text-[40px]" dateTime={now.toISOString()}>
            {day_formatter.format(now)}{" "}
          </time>
          <time className="text-[100px]" dateTime={now.toISOString()}>
            {time_formatter.format(now)}{" "}
          </time>
        </div>
      </div>
    </div>
  );
}
