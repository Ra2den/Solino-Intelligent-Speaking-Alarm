import { z } from "zod";

export const WeekdaySchema = z.enum([
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
]);
export type Weekday = z.infer<typeof WeekdaySchema>;

export const WeekdayArraySchema = z.array(WeekdaySchema).nullable();
export type WeekdayArray = z.infer<typeof WeekdayArraySchema>;

export const AlarmSchema = z.object({
  id: z.number(),
  time: z.string(),
  label: z.string(),
  active: z.boolean(),
  recurring_days: z.array(WeekdaySchema).nullable(),
});

export type Alarm = z.infer<typeof AlarmSchema>;