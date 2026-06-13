const DEFAULT_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

const DEFAULT_DAY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "2-digit",
  month: "long",
};

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function createTimeFormatter(
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale ?? undefined, options ?? DEFAULT_TIME_FORMAT_OPTIONS);
}

export function createDayFormatter(
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale ?? undefined, options ?? DEFAULT_DAY_FORMAT_OPTIONS);
}

export function formatTime(
  date: Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return createTimeFormatter(locale, options).format(date);
}

export function formatDay(
  date: Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return createDayFormatter(locale, options).format(date).replace(",", "");
}

export function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}
