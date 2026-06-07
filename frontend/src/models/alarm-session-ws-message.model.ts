import { z } from "zod";
import { AlarmSessionSchema } from "./alarm-session.model";

export const AlarmSessionWsTypeSchema = z.enum(["INITIAL_STATE", "UPDATE"]);

export const AlarmSessionWsMessageSchema = z.object({
  type: AlarmSessionWsTypeSchema,
  session: AlarmSessionSchema.nullable(),
});

export type AlarmSessionWsMessage = z.infer<typeof AlarmSessionWsMessageSchema>;
export type AlarmSessionWsType = z.infer<typeof AlarmSessionWsTypeSchema>;
