import { z } from "zod";

export const WeekdaySchema = z.enum(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
export type Weekday = z.infer<typeof WeekdaySchema>;

export const AlarmSchema = z.object({
  id: z.number(),
  time: z.string(),
  label: z.string(),
  active: z.boolean(),
  days: z.array(WeekdaySchema),
});

export type Alarm = z.infer<typeof AlarmSchema>;