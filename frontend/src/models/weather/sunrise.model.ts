import { z } from "zod";

export const SunriseSchema = z.object({
  time: z.string(),
});

export type Sunrise = z.infer<typeof SunriseSchema>;
