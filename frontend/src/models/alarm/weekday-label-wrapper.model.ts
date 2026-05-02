import { WeekdaySchema } from "./alarm.model";
import z from "zod";

export const WeekdayLabelWrapperSchema = z.object({
  label: z.string(),
  value: WeekdaySchema,
});

export type WeekdayLabelWrapper = z.infer<typeof WeekdayLabelWrapperSchema>;

export const WeekdayLabelWrapperArraySchema = z
  .array(WeekdayLabelWrapperSchema)
  .readonly();
