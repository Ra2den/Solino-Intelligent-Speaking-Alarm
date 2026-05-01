import z from "zod";

export const PhaseSchema = z.enum(["Sunrise", "Day", "Sunset", "Night"]);

export type Phase = z.infer<typeof PhaseSchema>;
