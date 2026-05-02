import { z } from "zod";

export const SunsetSchema = z.object({
  time: z.string(),
});

export type Sunset = z.infer<typeof SunsetSchema>;