import { z } from "zod";

export const AiStateSchema = z.enum([
  "IDLE",
  "LISTENING",
  "THINKING",
  "SPEAKING",
]);

export type AiState = z.infer<typeof AiStateSchema>;
