import { z } from "zod";

export const AlarmSchema = z.object({
  id: z.number(),
  time: z.string(),
  label: z.string(),
  active: z.boolean(),
});

export type Alarm = z.infer<typeof AlarmSchema>;