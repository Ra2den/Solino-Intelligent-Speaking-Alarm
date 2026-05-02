import { z } from "zod";

export const WeekdaySchema = z.enum(["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]);
export type Weekday = z.infer<typeof WeekdaySchema>;

export const AlarmVariantSchema = z.enum(["recurring", "one-time"]);
export type AlarmVariant = z.infer<typeof AlarmVariantSchema>;

export const AlarmSchema = z.object({
  id: z.number(),
  time: z.string(),
  label: z.string(),
  active: z.boolean(),
  days: z.array(WeekdaySchema).default([]),
  variant: AlarmVariantSchema.default("recurring"),
});

export type Alarm = z.infer<typeof AlarmSchema>;