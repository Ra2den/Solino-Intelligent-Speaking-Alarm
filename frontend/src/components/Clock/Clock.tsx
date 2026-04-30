import React, { useEffect, useState } from "react";
import styles from "./Clock.module.css";

type ClockProps = {
  className?: string;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  intervalMs?: number;
};

export default function Clock({
  className,
  locale,
  options,
  intervalMs = 1000,
}: ClockProps): React.ReactElement {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const formatter = new Intl.DateTimeFormat(locale ?? undefined, options ?? {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`${styles.wrapper} ${className ?? ""}`}>
      <div className={`${styles.flexboxOne} ${className ?? ""}`} />
        <div className={`${styles.flexboxTwo} ${className ?? ""}`}>
          <div className={`${styles.currentDay} ${className ?? ""}`}>
            Freitag, 24 April
          </div>
          <div className={`${styles.currentTime} ${className ?? ""}`}>
            <time dateTime={now.toISOString()}>{formatter.format(now)} </time>
          </div>
        </div>
    </div>
  )
}
