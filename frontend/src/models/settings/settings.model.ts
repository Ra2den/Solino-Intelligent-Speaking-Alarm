import { z } from "zod";

export const SettingsCategorySchema = z.enum(["GENERAL"]);

export const SettingsKeySchema = z.enum([
  "LANGUAGE",
  "VOICE",
  "VOLUME_PERCENT",
  "SNOOZE_DURATION_MIN",
  "OLLAMA_HEALTH_CHECK_TIMEOUT_SEC",
  "GUARD_MODE_TIMER_MIN",
  "GUARD_MODE_TOLERANCE_MIN",
  "WAKE_UP_MESSAGE_ENABLED",
]);

export const LanguageOptionSchema = z.enum(["GERMAN", "ENGLISH"]);
export const VoiceOptionSchema = z.enum(["MALE", "FEMALE"]);

export const SettingsItemSchema = z.object({
  key: SettingsKeySchema,
  category: SettingsCategorySchema,
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    VoiceOptionSchema,
    LanguageOptionSchema,
  ]),
});

export type SettingsItem = z.infer<typeof SettingsItemSchema>;
export type SettingsKey = z.infer<typeof SettingsKeySchema>;
export type SettingsCategory = z.infer<typeof SettingsCategorySchema>;
export type VoiceOption = z.infer<typeof VoiceOptionSchema>;
export type LanguageOption = z.infer<typeof LanguageOptionSchema>;
