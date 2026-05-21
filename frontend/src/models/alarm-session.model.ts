import { z } from "zod";

export const AlarmSessionStatusSchema = z.enum([
  "RINGING",
  "SNOOZED",
  "DISMISSED",
]);

export const AlarmSessionSchema = z.object({
  id: z.number(),
  alarm_id: z.number(),
  status: AlarmSessionStatusSchema,
  started_at: z.string(),
  snoozed_until: z.string().nullable(),
  label: z.string().nullable(),
  ring_count: z.number()
});

export type AlarmSession = z.infer<typeof AlarmSessionSchema>;
export type AlarmSessionStatus = z.infer<typeof AlarmSessionStatusSchema>;